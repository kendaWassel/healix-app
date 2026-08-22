import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  AppState,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../../utils/apiClient";


export default function DoctorCallNow({ navigation, route }) {
  const { patientId, consultationId, patient_phone, onDone } = route.params || {};
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patientPhone, setPatientPhone] = useState(patient_phone);
  const [message, setMessage] = useState("");
  const [canCall, setCanCall] = useState(false);

  const callWasOpenedRef = useRef(false);
  const appState = useRef(AppState.currentState);

  const finish = () => {
    if (onDone) {
      onDone();
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    if (patient_phone) {
      setPatientPhone(patient_phone);
    }
  }, [patient_phone]);

  useEffect(() => {
    if (!patientId || !consultationId) return;
    const initiateCall = async () => {
      setIsLoading(true);
      setError(null);
      setCanCall(false);
      try {
        const response = await apiFetch(`/api/consultations/${consultationId}/call`, {
          method: "POST",
        });
        const data = await response.json();
        if (!response.ok || data.status !== "success") {
          throw new Error(data.message || t("doctorCallNow.callInitiateFailed"));
        }
        setMessage(data.message || t("doctorCallNow.youCanCallNow"));
        setCanCall(true);
      } catch (err) {
        setError(err.message || t("doctorCallNow.callInitiateFailed"));
        setMessage(err.message || t("doctorCallNow.callInitiateFailed"));
        setCanCall(false);
      } finally {
        setIsLoading(false);
      }
    };
    initiateCall();
  }, [patientId, consultationId]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        if (callWasOpenedRef.current) {
          callWasOpenedRef.current = false;
          setTimeout(() => {
            navigation.replace("DoctorEndCallScreen", {
              consultationId,
              patientId,
            });
          }, 300);
        }
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [consultationId, patientId]);

  const handleCallClick = async () => {
    const phone = patientPhone || patient_phone;
    if (!phone) {
      setError(t("doctorCallNow.phoneMissing"));
      return;
    }
    const url = `tel:${phone}`;
    try {
      callWasOpenedRef.current = true;
      await Linking.openURL(url);
    } catch (err) {
      callWasOpenedRef.current = false;
      setError(t("doctorCallNow.dialerUnavailable"));
    }
  };

  return (
    <View style={styles.screen}>
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
                {t("doctorCallNow.patientPhone", { phone: patientPhone || patient_phone })}
              </Text>
            </View>
          )}
          {isLoading ? (
            <View style={styles.loadingBox}>
              <Text style={styles.loadingText}>{t("doctorCallNow.preparingCall")}</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleCallClick}
              disabled={!canCall || !(patientPhone || patient_phone) || !!error}
              style={[
                styles.callBtn,
                (!canCall || !(patientPhone || patient_phone) || error) && styles.callBtnDisabled,
              ]}
            >
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={styles.callBtnText}>{t("doctorCallNow.startConsultation")}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={finish} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>{t("common.cancel")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "rgba(5,36,67,0.5)" },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  errorText: { color: "#991b1b", fontSize: 13 },
  phoneBox: {
    width: "100%",
    backgroundColor: "#e6f7f7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  phoneText: { color: "#052443", fontSize: 13 },
  loadingBox: {
    width: "80%",
    backgroundColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  loadingText: { fontSize: 16, color: "#374151" },
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
  callBtnDisabled: { backgroundColor: "#9ca3af" },
  callBtnText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  cancelBtn: {
    width: "80%",
    backgroundColor: "#e71313",
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelBtnText: { color: "#fff", fontSize: 18, fontWeight: "600", textAlign: "center" },
});