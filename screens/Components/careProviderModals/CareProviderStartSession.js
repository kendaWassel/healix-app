import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PatientDetailsModal from "../../screens/doctor/doctorSchedules/PatientDetailsModal";
import CareProviderModifyMedicalReport from "./CareProviderModifyMedicalReport";
import DoneModal from "../../screens/patient/doctorConsultation/booking/DoneModal";
import { colors } from "../../constants/colors";
import { BASE_URL, NGROK_HEADERS } from "../../constants/api";

export default function CareProviderStartSession({
  isOpen,
  onClose,
  patientId,
  sessionId,
  providerType = "physiotherapist",
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showSessionDone, setShowSessionDone] = useState(false);

  const [isEnding, setIsEnding] = useState(false);
  const [endError, setEndError] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [showModifyReport, setShowModifyReport] = useState(false);
  const [currentMedicalReport, setCurrentMedicalReport] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setMessage("");
      setSessionStarted(false);
      setShowSessionDone(false);
      setIsEnding(false);
      setEndError(null);
      setPatientDetails(null);
      setShowDetailsModal(false);
      setDetailsError(null);
      setShowModifyReport(false);
      setCurrentMedicalReport(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !sessionId) return;

    const startSession = async () => {
      setIsLoading(true);
      setError(null);
      setSessionStarted(false);

      const token = await AsyncStorage.getItem("token");

      try {
        const response = await fetch(
          `${BASE_URL}/provider/${providerType}/schedules/${sessionId}/start-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...NGROK_HEADERS,
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        console.log("Start session response: ", data);

        if (!response.ok || data.status !== "success") {
          throw new Error(data.message || "Failed to start session");
        }

        setMessage(data.message || "Session started successfully");
        setSessionStarted(true);
      } catch (err) {
        setError(err.message || "Failed to start session");
        setMessage(err.message || "Failed to start session");
        setSessionStarted(false);
      } finally {
        setIsLoading(false);
      }
    };

    startSession();
  }, [isOpen]);

  const handleViewDetails = async () => {
    if (!patientId) {
      setDetailsError("Patient ID is missing");
      return;
    }

    setIsLoadingDetails(true);
    setDetailsError(null);
    setPatientDetails(null);

    const token = await AsyncStorage.getItem("token");

    try {
      const response = await fetch(
        `${BASE_URL}/patients/${patientId}/view-details`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || "Failed to fetch patient details");
      }

      const data = await response.json();
      console.log("Patient details data:", data);

      setPatientDetails(data.data || data);
      setShowDetailsModal(true);
    } catch (err) {
      setDetailsError(err.message || "Failed to load patient details. Please try again.");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) {
      setEndError("Session ID is missing");
      return;
    }

    setIsEnding(true);
    setEndError(null);

    const token = await AsyncStorage.getItem("token");

    try {
      const response = await fetch(
        `${BASE_URL}/provider/${providerType}/schedules/${sessionId}/end-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || "Failed to end session");
      }

      const data = await response.json();
      setMessage(data.message || "Session ended successfully");

      // Fetch medical report for modification
      try {
        const reportResponse = await fetch(
          `${BASE_URL}/patients/${patientId}/view-details`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...NGROK_HEADERS,
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (reportResponse.ok) {
          const reportData = await reportResponse.json();
          setCurrentMedicalReport(
            reportData.data?.medical_record || reportData.medical_record || {}
          );
        }
      } catch (err) {
        console.error("Failed to fetch medical report:", err);
      }

      // Show modify medical report modal
      setTimeout(() => {
        setShowModifyReport(true);
      }, 500);
    } catch (err) {
      setEndError(err.message || "Failed to end session. Please try again.");
    } finally {
      setIsEnding(false);
    }
  };

  const handleModifyReportComplete = () => {
    setShowModifyReport(false);
    setShowSessionDone(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.box}>
            <Text style={styles.title}>
              {sessionStarted ? "Session Control" : "Starting Session"}
            </Text>

            {endError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{endError}</Text>
              </View>
            )}

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.cancelBtnWide} onPress={onClose}>
                  <Text style={styles.cancelBtnWideText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : isLoading ? (
              <View style={styles.loadingBox}>
                <Text style={styles.loadingText}>Starting session...</Text>
              </View>
            ) : sessionStarted ? (
              <View style={{ gap: 12 }}>
                <TouchableOpacity
                  style={styles.viewDetailsBtn}
                  onPress={handleViewDetails}
                  disabled={isLoadingDetails}
                >
                  <FontAwesome5 name="file-alt" size={16} color={colors.white} />
                  <Text style={styles.viewDetailsBtnText}>
                    {isLoadingDetails ? "Loading..." : "View Details"}
                  </Text>
                </TouchableOpacity>

                {detailsError && (
                  <View style={styles.smallErrorBox}>
                    <Text style={styles.smallErrorText}>{detailsError}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.endSessionBtn}
                  onPress={handleEndSession}
                  disabled={isEnding}
                >
                  <Text style={styles.endSessionBtnText}>
                    {isEnding ? "Ending session..." : "End Session"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.cancelBtnWide} onPress={onClose}>
                <Text style={styles.cancelBtnWideText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {showDetailsModal && patientDetails && (
        <PatientDetailsModal
          details={patientDetails}
          onClose={() => {
            setShowDetailsModal(false);
            setPatientDetails(null);
            setDetailsError(null);
          }}
        />
      )}

      {showModifyReport && (
        <CareProviderModifyMedicalReport
          isOpen={showModifyReport}
          onClose={handleModifyReportComplete}
          onSave={handleModifyReportComplete}
          medicalReport={currentMedicalReport}
          patientId={patientId}
          sessionId={sessionId}
          providerType={providerType}
        />
      )}

      <DoneModal
        isOpen={showSessionDone}
        onHome={() => {
          setShowSessionDone(false);
          onClose();
        }}
        message="Session completed successfully!"
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.black40,
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: colors.white,
    width: "90%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "600", color: colors.gray800, marginBottom: 16, textAlign: "center" },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: "100%",
    alignItems: "center",
    gap: 10,
  },
  errorText: { color: colors.danger, fontSize: 13, textAlign: "center" },
  cancelBtnWide: {
    backgroundColor: "#e71313",
    width: "80%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtnWideText: { color: colors.white, fontSize: 16, fontWeight: "600" },
  loadingBox: {
    width: "80%",
    backgroundColor: colors.gray300,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingText: { textAlign: "center", fontSize: 16, color: colors.gray800 },
  viewDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.darkBlue,
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
  },
  viewDetailsBtnText: { color: colors.white, fontSize: 16, fontWeight: "600" },
  smallErrorBox: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 6,
    padding: 8,
  },
  smallErrorText: { color: colors.danger, fontSize: 12 },
  endSessionBtn: {
    backgroundColor: "#e71313",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  endSessionBtnText: { color: colors.white, fontSize: 16, fontWeight: "600" },
  closeBtn: {
    borderWidth: 1,
    borderColor: colors.gray300,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  closeBtnText: { color: colors.gray700, fontWeight: "500" },
});
