// screens/patient/DoctorConsultation/Booking/RatingModal.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

export default function RatingModal({ isOpen, onClose, url, message, onRatingSuccess }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleStarPress = (value) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(t("ratingModal.pleaseSelectRating"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const token = await AsyncStorage.getItem("token");

    try {
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patient/${url}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            stars: rating,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || t("ratingModal.submitFailed"));
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setRating(0);
        setSuccess(false);
        if (onRatingSuccess) {
          onRatingSuccess();
        }
      }, 1500);
    } catch (err) {
      setError(err.message || t("ratingModal.submitFailedRetry"));
    } finally {
      setIsSubmitting(false);
    }
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

          {success && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                {t("ratingModal.submitSuccess")}
              </Text>
            </View>
          )}

          {/* Star Rating */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= rating;
              return (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleStarPress(star)}
                  disabled={isSubmitting}
                  style={styles.starBtn}
                >
                  <Ionicons
                    name={isFilled ? "star" : "star-outline"}
                    size={40}
                    color={isFilled ? "#facc15" : "#d1d5db"}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {rating > 0 && (
            <Text style={styles.ratingText}>
              {t("ratingModal.youRated", {
                count: rating,
                starWord: rating === 1 ? t("ratingModal.star") : t("ratingModal.stars"),
              })}
            </Text>
          )}

          <View style={{ gap: 12, width: "100%" }}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || rating === 0}
              style={[
                styles.submitBtn,
                (isSubmitting || rating === 0) && styles.btnDisabled,
              ]}
            >
              <Text style={styles.submitBtnText}>
                {isSubmitting ? t("ratingModal.submitting") : t("ratingModal.submitRating")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              style={[styles.skipBtn, isSubmitting && styles.btnDisabled]}
            >
              <Text style={styles.skipBtnText}>{t("ratingModal.skip")}</Text>
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
  successBox: {
    width: "100%",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: "#166534",
    fontSize: 13,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  starBtn: {
    padding: 4,
  },
  ratingText: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 16,
  },
  submitBtn: {
    width: "100%",
    backgroundColor: "#052443",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  skipBtn: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  skipBtnText: {
    color: "#374151",
  },
  btnDisabled: {
    opacity: 0.5,
  },
});