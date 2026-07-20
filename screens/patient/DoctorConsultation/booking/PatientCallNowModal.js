// screens/patient/DoctorConsultation/Booking/PatientCallNowModal.js
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
import PatientEndCallModal from "./PatientEndCallModal";
import RatingModal from "./RatingModal";
import DoneModal from "./DoneModal";
import PaymentModal from "../../../Components/servicesCard/PayementModal";

export default function PatientCallNowModal({ isOpen, onClose, doctorId, onConfirm }) {
  const { t } = useTranslation();
  const [isCreatingConsultation, setIsCreatingConsultation] = useState(false);
  const [error, setError] = useState(null);
  const [consultationId, setConsultationId] = useState(null);
  const [doctorPhone, setDoctorPhone] = useState(null);
  const [message, setMessage] = useState("");
  const [showEndCallModal, setShowEndCallModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showBookingDone, setShowBookingDone] = useState(false);

  const callWasOpenedRef = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!isOpen) {
      setConsultationId(null);
      setError(null);
      setMessage("");
      setShowEndCallModal(false);
      setShowPaymentModal(false);
      setShowRatingModal(false);
      setShowBookingDone(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !doctorId) return;

    const createConsultation = async () => {
      setIsCreatingConsultation(true);
      setError(null);

      const token = await AsyncStorage.getItem("token");

      try {
        const response = await fetch(
          `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patient/consultations/book`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              doctor_id: doctorId,
              call_type: "call_now",
            }),
          }
        );

        const data = await response.json();
        console.log("consultation data: ", data);
        if (!response.ok || data.status !== "success") {
          throw new Error(data.message || t("patientCallNow.consultationFailed"));
        }

        setConsultationId(data.data.consultation_id);
        setDoctorPhone(data.data.doctor_phone);
        setMessage(data.message || t("patientCallNow.callBackendSuccess"));
      } catch (err) {
        setError(err.message || t("patientCallNow.consultationFailed"));
      } finally {
        setIsCreatingConsultation(false);
      }
    };

    createConsultation();
  }, [isOpen, doctorId]);

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

  const triggerCallApi = async () => {
    if (!consultationId) return;

    const token = await AsyncStorage.getItem("token");
    try {
      await fetch(
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
    } catch (err) {
      console.error("Failed to log call:", err);
    }
  };

  const handleCallClick = async () => {
    const phone = doctorPhone;
    if (!phone) {
      setError(t("patientCallNow.phoneMissing"));
      return;
    }

    triggerCallApi();

    const url = `tel:${phone}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      setError(t("patientCallNow.dialerUnavailable"));
      return;
    }

    callWasOpenedRef.current = true;
    await Linking.openURL(url);

    if (onConfirm) onConfirm();
  };

  const handleEndCallSuccess = () => {
    setShowEndCallModal(false);
    setMessage(t("patientCallNow.callEndedSuccess"));
    setTimeout(() => {
      setShowPaymentModal(true);
    }, 600);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setTimeout(() => {
      setShowRatingModal(true);
    }, 300);
  };

  const handleRatingSkip = () => {
    setShowRatingModal(false);
    setTimeout(() => {
      setShowBookingDone(true);
    }, 300);
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{message}</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.phoneBox}>
            <Text style={styles.phoneText}>{doctorPhone}</Text>
          </View>

          {isCreatingConsultation ? (
            <View style={styles.loadingBox}>
              <Text style={styles.loadingText}>{t("patientCallNow.creatingConsultation")}</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleCallClick}
              disabled={!consultationId || !!error}
              style={[
                styles.callBtn,
                (!consultationId || error) && styles.btnDisabled,
              ]}
            >
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={styles.callBtnText}>{t("patientCallNow.startConsultation")}</Text>
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
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          paymentType="doctor"
        />
        <RatingModal
          isOpen={showRatingModal}
          onClose={handleRatingSkip}
          url={`consultations/${consultationId}/rate/${doctorId}`}
          onRatingSuccess={() => {
            setShowRatingModal(false);
            setTimeout(() => {
              setShowBookingDone(true);
            }, 300);
          }}
          message={t("patientCallNow.rateTheDoctor")}
        />
        <DoneModal
          isOpen={showBookingDone}
          onHome={() => {
            setShowBookingDone(false);
            onClose();
          }}
          message={t("patientCallNow.thankYouFeedback")}
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
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
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
    textAlign: "center",
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
  callBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  btnDisabled: {
    backgroundColor: "#9ca3af",
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