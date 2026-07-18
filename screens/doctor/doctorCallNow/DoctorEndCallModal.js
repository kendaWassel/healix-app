// screens/doctor/DoctorEndCallModal.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import PatientDetailsModal from "../doctorSchedules/PatientDetailsModal";
import CreatePrescription from "../prescription/CreatePrescription";
import ModifyMedicalReport from "../doctorSchedules/ModifyMedicalReport";

export default function DoctorEndCallModal({
  isOpen,
  onClose,
  consultationId,
  patientId,
  onEndSuccess,
}) {
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("Consultation is in progress");
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
  const [showPrescriptionPopup, setShowPrescriptionPopup] = useState(false);
  const [showModifyReport, setShowModifyReport] = useState(false);
  const [currentMedicalReport, setCurrentMedicalReport] = useState(null);

  const formatTime = (date) => {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  const handleViewMedicalReport = async () => {
    if (!patientId) {
      setReportError("Patient ID is missing");
      return;
    }

    setIsLoadingReport(true);
    setReportError(null);
    setMedicalReport(null);

    const token = await AsyncStorage.getItem("token");

    try {
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patients/${patientId}/view-details`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || "Failed to fetch medical report");
      }

      const data = await response.json();
      console.log("Medical report data:", data);

      setMedicalReport(data.data || data);
      setShowReportModal(true);
    } catch (err) {
      setReportError(
        err.message || "Failed to load medical report. Please try again."
      );
    } finally {
      setIsLoadingReport(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setShowCareProviderPopup(false);
      setShowPrescriptionPopup(false);
      setShowModifyReport(false);
      setCurrentMedicalReport(null);
      setError(null);
      setMessage("Consultation is in progress");
      setServiceReason("");
      setType("");
      setScheduledTime("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (showModifyReport && patientId && !currentMedicalReport) {
      const fetchMedicalReport = async () => {
        const token = await AsyncStorage.getItem("token");
        try {
          const response = await fetch(
            `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patients/${patientId}/view-details`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setCurrentMedicalReport(
              data.data?.medical_record || data.medical_record || {}
            );
          }
        } catch (err) {
          console.error("Failed to fetch medical report:", err);
        }
      };
      fetchMedicalReport();
    }
  }, [showModifyReport, patientId, currentMedicalReport]);

  const handleEndCall = async () => {
    if (!consultationId) {
      setError("Consultation ID is missing");
      return;
    }

    setIsEnding(true);
    setError(null);

    const token = await AsyncStorage.getItem("token");

    try {
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/consultations/${consultationId}/end`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || "Failed to end call");
      }

      const data = await response.json();
      setMessage(data.message || "Call ended successfully");

      setTimeout(() => {
        setShowCareProviderPopup(true);
      }, 500);
    } catch (err) {
      setError(err.message || "Failed to end call. Please try again.");
    } finally {
      setIsEnding(false);
    }
  };

  const handleCareProviderRequest = async () => {
    if (!type) {
      setError("Please select a service type");
      return;
    }
    if (!serviceReason.trim()) {
      setError("Please enter a reason for the service");
      return;
    }
    if (!scheduledTime) {
      setError("Please select a scheduled time");
      return;
    }
    setIsSendingRequest(true);
    const token = await AsyncStorage.getItem("token");

    try {
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/doctor/home-visit/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            consultation_id: consultationId,
            patient_id: patientId,
            service_type: type,
            reason: serviceReason,
            scheduled_at: scheduledTime,
          }),
        }
      );
      if (response.ok) {
        console.log(`${type} requested successfully`);
        setShowCareProviderPopup(false);
        setShowPrescriptionPopup(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Failed to request service");
      }
    } catch (err) {
      console.error(`Failed to request ${type}:`, err);
      setError("Failed to request service. Please try again.");
    }
    setIsSendingRequest(false);
  };

  const handleSkipCareProvider = () => {
    setShowCareProviderPopup(false);
    setShowPrescriptionPopup(true);
  };

  const handlePrescriptionComplete = () => {
    setShowPrescriptionPopup(false);
    setShowModifyReport(true);
  };

  const handlePrescriptionSkip = () => {
    setShowPrescriptionPopup(false);
    setShowModifyReport(true);
  };

  const handleModifyReportComplete = () => {
    setShowModifyReport(false);
    if (onEndSuccess) {
      onEndSuccess();
    }
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ScrollView
          contentContainerStyle={styles.overlayScroll}
          showsVerticalScrollIndicator={false}
        >
          {!showCareProviderPopup ? (
            // 🔹 المرحلة 1 — "Consultation is in progress"
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
                    {isLoadingReport ? "Loading..." : "View Medical Report"}
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
                    {isEnding ? "Ending call..." : "End Call"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose} style={styles.outlineBtn}>
                  <Text style={styles.outlineBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // 🔹 المرحلة 2 — "Request Care Provider" (نفس النافذة، محتوى مختلف)
            <View style={styles.card}>
              <Text style={styles.title}>Request Care Provider</Text>
              <Text style={styles.subtitle}>
                Choose physiotherapist or nurse
              </Text>

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
                  style={[
                    styles.choiceBtn,
                    type === "physiotherapist" && styles.choiceBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.choiceBtnText,
                      type === "physiotherapist" && styles.choiceBtnTextActive,
                    ]}
                  >
                    Request Physiotherapist
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setType("nurse");
                    setError(null);
                  }}
                  style={[
                    styles.choiceBtn,
                    type === "nurse" && styles.choiceBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.choiceBtnText,
                      type === "nurse" && styles.choiceBtnTextActive,
                    ]}
                  >
                    Request Nurse
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Reason for Service</Text>
                <TextInput
                  value={serviceReason}
                  onChangeText={(t) => {
                    setServiceReason(t);
                    setError(null);
                  }}
                  placeholder="Enter the reason for the care service"
                  style={styles.input}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Scheduled Time</Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  style={styles.input}
                >
                  <Text style={{ color: scheduledTime ? "#111827" : "#9ca3af" }}>
                    {scheduledTime || "Select time"}
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
                  disabled={
                    !type ||
                    !serviceReason.trim() ||
                    !scheduledTime ||
                    isSendingRequest
                  }
                  style={[
                    styles.primaryBtn,
                    (!type ||
                      !serviceReason.trim() ||
                      !scheduledTime ||
                      isSendingRequest) &&
                      styles.btnDisabled,
                  ]}
                >
                  <Text style={styles.primaryBtnText}>
                    {isSendingRequest ? "Sending Request..." : "Send Request"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSkipCareProvider}
                  style={styles.dangerBtn}
                >
                  <Text style={styles.dangerBtnText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

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

      {showPrescriptionPopup && (
        <CreatePrescription
          isOpen={showPrescriptionPopup}
          onClose={handlePrescriptionSkip}
          onSave={handlePrescriptionComplete}
          consultationId={consultationId}
          patientId={patientId}
        />
      )}

      {showModifyReport && (
        <ModifyMedicalReport
          isOpen={showModifyReport}
          onClose={handleModifyReportComplete}
          onSave={handleModifyReportComplete}
          medicalReport={currentMedicalReport}
          patientId={patientId}
          consultationId={consultationId}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(5,36,67,0.5)",
  },
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
  message: {
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    color: "#374151",
    marginBottom: 20,
    textAlign: "center",
  },
  errorBox: {
    width: "100%",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#991b1b",
    fontSize: 13,
  },
  errorBoxSmall: {
    width: "100%",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 6,
    padding: 8,
  },
  errorTextSmall: {
    color: "#991b1b",
    fontSize: 11,
  },
  buttonGroup: {
    width: "100%",
    gap: 12,
  },
  choiceGroup: {
    width: "100%",
    gap: 10,
    marginBottom: 16,
  },
  fieldBlock: {
    width: "100%",
    marginBottom: 16,
  },
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
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerBtn: {
    width: "100%",
    minHeight: 48,
    backgroundColor: "#e71313",
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  dangerBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
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
  outlineBtnText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  choiceBtn: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },
  choiceBtnActive: {
    backgroundColor: "#052443",
  },
  choiceBtnText: {
    color: "#374151",
    fontWeight: "500",
  },
  choiceBtnTextActive: {
    color: "#fff",
  },
  label: {
    textAlign: "left",
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    minHeight: 44,
  },
});