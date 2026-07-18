// screens/patient/DoctorConsultation/Booking/PatientEndCallModal.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PatientEndCallModal({
  isOpen,
  onClose,
  consultationId,
  onEndSuccess,
}) {
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("Consultation is in progress");

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

      if (onEndSuccess) {
        onEndSuccess();
      }

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || "Failed to end call. Please try again.");
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Consultation in Progress</Text>
          <Text style={styles.message}>{message}</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={{ gap: 12, width: "100%" }}>
            <TouchableOpacity
              onPress={handleEndCall}
              disabled={isEnding}
              style={[styles.endBtn, isEnding && styles.btnDisabled]}
            >
              <Text style={styles.endBtnText}>
                {isEnding ? "Ending call..." : "End Call"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    color: "#374151",
    marginBottom: 16,
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
  endBtn: {
    width: "100%",
    backgroundColor: "#e71313",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  endBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  closeBtn: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#374151",
  },
  btnDisabled: {
    opacity: 0.5,
  },
});