import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import PatientDetailsModal from "../doctorSchedules/PatientDetailsModal";
import { apiFetch } from "../../../utils/apiClient";
import { Alert } from "react-native";

export default function DoctorEndCallModal({ navigation, route }) {
  const { consultationId, patientId, onEndSuccess, onDone } = route.params || {};
  const { t } = useTranslation();
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(t("doctorEndCall.consultationInProgress"));
  const [serviceReason, setServiceReason] = useState("");
  const [type, setType] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [medicalReport, setMedicalReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [showCareProviderPopup, setShowCareProviderPopup] = useState(false);

  const formatTime = (date) => {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  const finish = () => {
    if (onDone) {
      onDone();
    } else {
      navigation.goBack();
    }
  };

  const handleViewMedicalReport = async () => {
    if (!patientId) {
      setReportError(t("doctorEndCall.patientIdMissing"));
      return;
    }
    setIsLoadingReport(true);
    setReportError(null);
    setMedicalReport(null);
    try {
      const response = await apiFetch(`/api/patients/${patientId}/view-details`);
      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || t("doctorEndCall.fetchReportFailed"));
      }
      const data = await response.json();
      setMedicalReport(data.data || data);
      setShowReportModal(true);
    } catch (err) {
      setReportError(err.message || t("doctorEndCall.loadReportFailedRetry"));
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleEndCall = async () => {
    if (!consultationId) {
      setError(t("doctorEndCall.consultationIdMissing"));
      return;
    }
    setIsEnding(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/consultations/${consultationId}/end`, {
        method: "POST",
      });
      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || t("doctorEndCall.endCallFailed"));
      }
      const data = await response.json();
      setMessage(data.message || t("doctorEndCall.callEndedSuccess"));
      setTimeout(() => setShowCareProviderPopup(true), 500);
    } catch (err) {
      setError(err.message || t("doctorEndCall.endCallFailedRetry"));
    } finally {
      setIsEnding(false);
    }
  };


  const goToModifyReport = async () => {
    let currentMedicalReport = {};
    try {
      const response = await apiFetch(`/api/patients/${patientId}/view-details`);
      if (response.ok) {
        const data = await response.json();
        currentMedicalReport = data.data?.medical_record || data.medical_record || {};
      }
    } catch (err) {
      console.error("Failed to fetch medical report:", err);
    }
    const fields = {
      diagnosis: currentMedicalReport.diagnosis || "",
      chronic_diseases: currentMedicalReport.chronic_diseases || "",
      previous_surgeries: currentMedicalReport.previous_surgeries || "",
      allergies: currentMedicalReport.allergies || "",
      current_medications: currentMedicalReport.current_medications || "",
      treatment_plan: currentMedicalReport.treatment_plan || "",
    };
    navigation.replace("MedicalReportScreen", {
      initialValues: fields,
      isEdit: true,
      showTreatmentPlan: true,
      onSubmit: submitModifyReport,
      afterSuccessScreen: "DoctorSchedules",
    });
  };


  const submitModifyReport = async (formFields) => {
    try {
      const dataToSubmit = { ...formFields, consultation_id: consultationId };
      const response = await apiFetch(`/api/patients/${patientId}/medical-record/update`, {
        method: "PUT",
        body: JSON.stringify(dataToSubmit),
      });
      if (response.ok) {
        if (onEndSuccess) onEndSuccess();
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert("Error", errorData.message || t("doctorEndCall.updateFailed") || "فشل التحديث");
        return false;
      }
    } catch (err) {
      console.error("Error updating medical report:", err);
      Alert.alert("Error", t("doctorEndCall.updateFailedRetry") || "حدث خطأ، حاولي مجدداً");
      return false;
    }
  };

  const goToPrescription = () => {
    navigation.replace("CreatePrescriptionScreen", {
      consultationId,
      patientId,
      onDone: goToModifyReport,
    });
  };

  const handleCareProviderRequest = async () => {
    if (!type) {
      setError(t("doctorEndCall.selectServiceType"));
      return;
    }
    if (!serviceReason.trim()) {
      setError(t("doctorEndCall.enterReason"));
      return;
    }
    if (!scheduledTime) {
      setError(t("doctorEndCall.selectScheduledTime"));
      return;
    }
    setIsSendingRequest(true);
    try {
      const response = await apiFetch(`/api/doctor/home-visit/request`, {
        method: "POST",
        body: JSON.stringify({
          consultation_id: consultationId,
          patient_id: patientId,
          service_type: type,
          reason: serviceReason,
          scheduled_at: scheduledTime,
        }),
      });
      const responseBody = await response.json().catch(() => ({}));
      if (response.ok) {
        goToPrescription();
      } else {
        setError(responseBody.message || t("doctorEndCall.requestServiceFailed"));
      }
    } catch (err) {
      setError(t("doctorEndCall.requestServiceFailedRetry"));
    }
    setIsSendingRequest(false);
  };

  const handleSkipCareProvider = () => {
    goToPrescription();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.overlayScroll}>
        {!showCareProviderPopup ? (
          <View style={styles.card}>
            <Text style={styles.message}>{message}</Text>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                onPress={handleViewMedicalReport}
                disabled={isLoadingReport || !patientId}
                style={[
                  styles.primaryBtn,
                  (isLoadingReport || !patientId) && styles.btnDisabled,
                ]}
              >
                <Ionicons name="document-text-outline" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>
                  {isLoadingReport ? t("doctorEndCall.loading") : t("doctorEndCall.viewMedicalReport")}
                </Text>
              </TouchableOpacity>
              {reportError && (
                <View style={styles.errorBoxSmall}>
                  <Text style={styles.errorTextSmall}>{reportError}</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={handleEndCall}
                disabled={isEnding}
                style={[styles.dangerBtn, isEnding && styles.btnDisabled]}
              >
                <Text style={styles.dangerBtnText}>
                  {isEnding ? t("doctorEndCall.endingCall") : t("doctorEndCall.endCall")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={finish} style={styles.outlineBtn}>
                <Text style={styles.outlineBtnText}>{t("doctorEndCall.close")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.title}>{t("doctorEndCall.requestCareProvider")}</Text>
            <Text style={styles.subtitle}>{t("doctorEndCall.choosePhysioOrNurse")}</Text>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            <View style={styles.choiceGroup}>
              <TouchableOpacity
                onPress={() => {
                  setType("physiotherapist");
                  setError(null);
                }}
                style={[styles.choiceBtn, type === "physiotherapist" && styles.choiceBtnActive]}
              >
                <Text style={[styles.choiceBtnText, type === "physiotherapist" && styles.choiceBtnTextActive]}>
                  {t("doctorEndCall.requestPhysiotherapist")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setType("nurse");
                  setError(null);
                }}
                style={[styles.choiceBtn, type === "nurse" && styles.choiceBtnActive]}
              >
                <Text style={[styles.choiceBtnText, type === "nurse" && styles.choiceBtnTextActive]}>
                  {t("doctorEndCall.requestNurse")}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>{t("doctorEndCall.reasonForService")}</Text>
              <TextInput
                value={serviceReason}
                onChangeText={(t2) => {
                  setServiceReason(t2);
                  setError(null);
                }}
                placeholder={t("doctorEndCall.reasonPlaceholder")}
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>{t("doctorEndCall.scheduledTime")}</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
                <Text style={{ color: scheduledTime ? "#111827" : "#9ca3af" }}>
                  {scheduledTime || t("doctorEndCall.selectTime")}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  is24Hour
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    setShowTimePicker(false);
                    if (selectedDate) {
                      setScheduledTime(formatTime(selectedDate));
                      setError(null);
                    }
                  }}
                />
              )}
            </View>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                onPress={handleCareProviderRequest}
                disabled={!type || !serviceReason.trim() || !scheduledTime || isSendingRequest}
                style={[
                  styles.primaryBtn,
                  (!type || !serviceReason.trim() || !scheduledTime || isSendingRequest) && styles.btnDisabled,
                ]}
              >
                <Text style={styles.primaryBtnText}>
                  {isSendingRequest ? t("doctorEndCall.sendingRequest") : t("doctorEndCall.sendRequest")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSkipCareProvider} style={styles.dangerBtn}>
                <Text style={styles.dangerBtnText}>{t("doctorEndCall.skip")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      {showReportModal && medicalReport && (
        <PatientDetailsModal
          details={medicalReport}
          onClose={() => {
            setShowReportModal(false);
            setMedicalReport(null);
            setReportError(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f3f4f6" },
  overlayScroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "stretch",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  message: { color: "#374151", marginBottom: 16, textAlign: "center" },
  title: { fontSize: 20, fontWeight: "600", color: "#111827", marginBottom: 12, textAlign: "center" },
  subtitle: { color: "#374151", marginBottom: 20, textAlign: "center" },
  errorBox: {
    width: "100%",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#991b1b", fontSize: 13 },
  errorBoxSmall: {
    width: "100%",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 6,
    padding: 8,
  },
  errorTextSmall: { color: "#991b1b", fontSize: 11 },
  buttonGroup: { width: "100%", gap: 12 },
  choiceGroup: { width: "100%", gap: 10, marginBottom: 16 },
  fieldBlock: { width: "100%", marginBottom: 16 },
  primaryBtn: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#052443",
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  dangerBtn: {
    width: "100%",
    minHeight: 48,
    backgroundColor: "#e71313",
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  dangerBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  outlineBtn: {
    width: "100%",
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 11,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  outlineBtnText: { color: "#374151", fontSize: 16, fontWeight: "600" },
  btnDisabled: { opacity: 0.5 },
  choiceBtn: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },
  choiceBtnActive: { backgroundColor: "#052443" },
  choiceBtnText: { color: "#374151", fontWeight: "500" },
  choiceBtnTextActive: { color: "#fff" },
  label: { textAlign: "left", fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
     backgroundColor: "#fff",
    color: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    minHeight: 44,
  },
});