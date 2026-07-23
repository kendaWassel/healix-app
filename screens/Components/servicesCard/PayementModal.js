import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function PaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  paymentType = "service",
}) {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const getPaymentTypeLabel = () => {
    const labels = {
      doctor: t("paymentModal.doctorConsultation"),
      delivery: t("paymentModal.deliveryOrder"),
      careprovider: t("paymentModal.careProviderSession"),
    };

    return labels[paymentType];
  };

  const handlePayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);

      setTimeout(() => {
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      }, 1500);
    }, 2000);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setIsPaid(false);
      onClose();
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {!isPaid ? (
            <>
              <View style={styles.headerSection}>
                <Ionicons
                  name="card"
                  size={48}
                  color="#052443"
                  style={{ marginBottom: 12 }}
                />
                <Text style={styles.title}>{t("paymentModal.paymentRequired")}</Text>
                <Text style={styles.subtitle}>{getPaymentTypeLabel()}</Text>
              </View>

              <View style={{ gap: 12, width: "100%" }}>
                <TouchableOpacity
                  onPress={handlePayment}
                  disabled={isProcessing}
                  style={[styles.payBtn, isProcessing && styles.btnDisabled]}
                >
                  {isProcessing ? (
                    <>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.payBtnText}>{t("paymentModal.processingPayment")}</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="card-outline" size={20} color="#fff" />
                      <Text style={styles.payBtnText}>{t("paymentModal.payNow")}</Text>
                    </>
                  )}
                </TouchableOpacity>

                {!isProcessing && (
                  <TouchableOpacity onPress={handleClose} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>{t("common.cancel")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <View style={styles.successSection}>
              <Ionicons
                name="checkmark-circle"
                size={64}
                color="#22c55e"
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.title}>{t("paymentModal.paymentSuccessful")}</Text>
              <Text style={styles.successText}>
                {t("paymentModal.paymentSuccessText")}
              </Text>
            </View>
          )}
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
    padding: 28,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#4b5563",
    textAlign: "center",
  },
  payBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#052443",
    paddingVertical: 14,
    borderRadius: 8,
  },
  payBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  cancelBtn: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#374151",
  },
  successSection: {
    alignItems: "center",
    paddingVertical: 10,
  },
  successText: {
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 8,
  },
});