// screens/doctor/DoctorCallNow.js
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
import DoctorEndCallModal from "./DoctorEndCallModal";
import DoneModal from "../../patient/DoctorConsultation/booking/DoneModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DoctorCallNow({
  isOpen,
  onClose,
  patientId,
  consultationId,
  patient_phone,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patientPhone, setPatientPhone] = useState(patient_phone);
  const [message, setMessage] = useState("");
  const [showEndCallModal, setShowEndCallModal] = useState(false);
  const [showConsDone, setShowConsDone] = useState(false);
  const [canCall, setCanCall] = useState(false);

  // تتبّع هل المستخدم غادر التطبيق فعلاً بسبب المكالمة (بديل window.onblur/onfocus)
  const callWasOpenedRef = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setMessage("");
      setPatientPhone(null);
      setShowEndCallModal(false);
      setShowConsDone(false);
      setCanCall(false);
    } else {
      if (patient_phone) {
        console.log("Setting patient phone from prop:", patient_phone);
        setPatientPhone(patient_phone);
      }
    }
  }, [isOpen, patient_phone]);

  useEffect(() => {
    if (!isOpen || !patientId || !consultationId) return;

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
          throw new Error(data.message || "Failed to initiate call");
        }
        setMessage(data.message || "You can call the patient now");
        setCanCall(true);
      } catch (err) {
        setError(err.message || "Failed to initiate call");
        setMessage(err.message || "Failed to initiate call");
        setCanCall(false);
      } finally {
        setIsLoading(false);
      }
    };

    initiateCall();
  }, [isOpen, patientId, consultationId]);

  // مراقبة حالة التطبيق — بديل window.onblur/onfocus
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      // التطبيق ذهب للخلفية (المستخدم فتح تطبيق الهاتف للاتصال)
      if (appState.current === "active" && nextState.match(/inactive|background/)) {
        if (callWasOpenedRef.current) {
          // لا شيء الآن — ننتظر العودة
        }
      }
      // التطبيق عاد للمقدمة
      if (appState.current.match(/inactive|background/) && nextState === "active") {
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
    const phone = patientPhone || patient_phone;
    if (!phone) {
      setError("Patient phone number missing.");
      return;
    }

    const url = `tel:${phone}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      setError("Cannot open phone dialer on this device.");
      return;
    }

    callWasOpenedRef.current = true;
    await Linking.openURL(url);
  };

  const handleEndCallSuccess = () => {
    setShowEndCallModal(false);
    setMessage("Call ended successfully.");
    setTimeout(() => {
      setShowConsDone(true);
    }, 300);
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

          {(patientPhone || patient_phone) && (
            <View style={styles.phoneBox}>
              <Text style={styles.phoneText}>
                Patient Phone: {patientPhone || patient_phone}
              </Text>
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingBox}>
              <Text style={styles.loadingText}>Preparing call...</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleCallClick}
              disabled={!canCall || !(patientPhone || patient_phone) || !!error}
              style={[
                styles.callBtn,
                (!canCall || !(patientPhone || patient_phone) || error) &&
                  styles.callBtnDisabled,
              ]}
            >
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={styles.callBtnText}>Start consultation</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <DoctorEndCallModal
          isOpen={showEndCallModal}
          onClose={() => setShowEndCallModal(false)}
          consultationId={consultationId}
          patientId={patientId}
          onEndSuccess={handleEndCallSuccess}
        />
        <DoneModal
          isOpen={showConsDone}
          onHome={() => {
            setShowConsDone(false);
            onClose();
          }}
          message="Call completed successfully!"
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