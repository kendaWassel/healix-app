import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, Modal, Linking, AppState, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import PatientEndCallModal from "./PatientEndCallModal";
import RatingModal from "./RatingModal";
import DoneModal from "./DoneModal";
import PaymentScreen from "../../../Components/servicesCard/PaymentScreen";
import { apiFetch } from "../../../../utils/apiClient";

export default function PatientCallNowModal({
  isOpen,
  onClose,
  doctorId,
  onConfirm,
  onChooseAnotherDoctor,
}) {
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
      try {
        const response = await apiFetch(
          `/api/patient/consultations/book`,
          {
            method: "POST",
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
    try {
      await apiFetch(
        `/api/consultations/${consultationId}/call`,
        {
          method: "POST",
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
    try {
      callWasOpenedRef.current = true;
      await Linking.openURL(url);
      if (onConfirm) onConfirm();
    } catch (err) {
      callWasOpenedRef.current = false;
      setError(t("patientCallNow.dialerUnavailable"));
    }
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

  // When the doctor is unavailable (or any other booking failure), the
  // patient shouldn't be stuck staring at an error with no way forward —
  // this closes the modal and hands control back to the parent screen so
  // it can route to doctor selection.
  const handleChooseAnotherDoctor = () => {
    onClose();
    if (onChooseAnotherDoctor) onChooseAnotherDoctor();
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{message}</Text>

          {error && (
            <View style={styles.errorBox}>
              <View style={styles.errorIconRow}>
                <View style={styles.errorIconCircle}>
                  <Ionicons name="alert-circle" size={22} color="#dc2626" />
                </View>
                <Text style={styles.errorText}>{error}</Text>
              </View>
          
              {onChooseAnotherDoctor && (
                <TouchableOpacity
                  onPress={handleChooseAnotherDoctor}
                  style={styles.chooseAnotherBtn}
                  activeOpacity={0.85}
                >
                  <Ionicons name="people" size={18} color="#fff" />
                  <Text style={styles.chooseAnotherBtnText}>
                    {t("patientCallNow.chooseAnotherDoctor")}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              )}
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

        {/* 👇 نافذة الدفع — نمط Stripe الجديد */}
        {showPaymentModal && (
          <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={() => setShowPaymentModal(false)}
          >
            <View style={styles.overlay}>
              <View style={styles.paymentCard}>
                <PaymentScreen
                  payableType="consultation"
                  payableId={consultationId}
                  onSuccess={() => {
                    setShowPaymentModal(false);
                    handlePaymentSuccess();
                  }}
                />
                <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                  <Text style={styles.paymentCancelText}>{t("common.cancel")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

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
  borderWidth: 1.5,
  borderColor: "#fecaca",
  borderRadius: 14,
  padding: 16,
  marginBottom: 16,
},
errorText: {
  flex: 1,
  color: "#991b1b",
  fontSize: 13,
  fontWeight: "500",
  lineHeight: 18,
},
chooseAnotherBtn: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  backgroundColor: "#052443",
  paddingVertical: 13,
  borderRadius: 10,
  shadowColor: "#052443",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 4,
},
chooseAnotherBtnText: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "700",
},
  errorIconRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  marginBottom: 14,
},
errorIconCircle: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#fee2e2",
  alignItems: "center",
  justifyContent: "center",
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
  paymentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  paymentCancelText: {
    textAlign: "center",
    marginTop: 12,
    color: "#767676",
  },
});