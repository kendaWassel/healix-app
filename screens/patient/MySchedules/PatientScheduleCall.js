import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Linking,
  AppState,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import PatientEndCallModal from "../DoctorConsultation/booking/PatientEndCallModal";
import RatingModal from "../DoctorConsultation/booking/RatingModal";
import DoneModal from "../DoctorConsultation/booking/DoneModal";

export default function PatientScheduleCall({
  isOpen,
  onClose,
  consultationId,
  doctorId,
  doctorPhone,
}) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [showEndCallModal, setShowEndCallModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showBookingDone, setShowBookingDone] = useState(false);
  const [canCall, setCanCall] = useState(false);

  const callWasOpenedRef = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setMessage("");
      setShowEndCallModal(false);
      setShowRatingModal(false);
      setShowBookingDone(false);
      setCanCall(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !consultationId) return;

    const initiateCall = async () => {
      setIsLoading(true);
      setError(null);
      setCanCall(false);

      const token = await AsyncStorage.getItem("token");

      try {
        const response = await fetch(
          `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/consultations/${consultationId}/call`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        console.log("Call initiation response: ", data);

        if (!response.ok || data.status !== "success") {
          throw new Error(data.message || t("patientScheduleCall.callInitiateFailed"));
        }

        setMessage(data.message || t("patientScheduleCall.youCanCallNow"));
        setCanCall(true);
      } catch (err) {
        setError(err.message || t("patientScheduleCall.callInitiateFailed"));
        setMessage(err.message || t("patientScheduleCall.callInitiateFailed"));
        setCanCall(false);
      } finally {
        setIsLoading(false);
      }
    };

    initiateCall();
  }, [isOpen, consultationId]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        if (callWasOpenedRef.current) {
          setTimeout(() => setShowEndCallModal(true), 300);
          callWasOpenedRef.current = false;
        }
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, []);

  const handleCallClick = async () => {
    const phone = doctorPhone;
    if (!phone) {
      setError(t("patientScheduleCall.phoneMissing"));
      return;
    }

    const url = `tel:${phone}`;
   try {
    callWasOpenedRef.current = true;
    await Linking.openURL(url);
  } catch (err) {
    callWasOpenedRef.current = false;
    setError(t("patientScheduleCall.dialerUnavailable"));
  }
};

  const handleEndCallSuccess = () => {
    setShowEndCallModal(false);
    setMessage(t("patientScheduleCall.callEndedSuccess"));
    setShowRatingModal(true);
  };

  const handleRatingSuccess = () => {
    setShowRatingModal(false);
    setShowBookingDone(true);
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {doctorPhone && (
            <View style={styles.phoneBox}>
              <Text style={styles.phoneText}>
                {t("patientScheduleCall.doctorPhone", { phone: doctorPhone })}
              </Text>
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingBox}>
              <Text style={styles.loadingText}>{t("patientScheduleCall.preparingCall")}</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleCallClick}
              disabled={!canCall || !doctorPhone || !!error}
              style={[
                styles.callBtn,
                (!canCall || !doctorPhone || error) && styles.callBtnDisabled,
              ]}
            >
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={styles.callBtnText}>{t("patientScheduleCall.startConsultation")}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>{t("common.cancel")}</Text>
          </TouchableOpacity>
        </View>

        <PatientEndCallModal
          isOpen={showEndCallModal}
          onClose={() => setShowEndCallModal(false)}
          consultationId={consultationId}
          onEndSuccess={handleEndCallSuccess}
        />
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setShowBookingDone(true);
          }}
          url={`consultations/${consultationId}/rate/${doctorId}`}
          onRatingSuccess={handleRatingSuccess}
          message={t("patientScheduleCall.rateTheDoctor")}
        />
        <DoneModal
          isOpen={showBookingDone}
          onHome={() => {
            setShowBookingDone(false);
            onClose();
          }}
          message={t("patientScheduleCall.thankYouFeedback")}
        />
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(5,36,67,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
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
  phoneBox: {
    width: "100%",
    backgroundColor: "#e6f7f7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  phoneText: {
    color: "#052443",
    fontSize: 13,
  },
  loadingBox: {
    width: "80%",
    backgroundColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#374151",
  },
  callBtn: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#052443",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  callBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  callBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  cancelBtn: {
    width: "80%",
    backgroundColor: "#e71313",
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});