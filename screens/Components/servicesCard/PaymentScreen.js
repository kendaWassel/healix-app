import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from "react-native";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../../utils/apiClient";

export default function PaymentScreen({ payableType, payableId, onSuccess }) {
  const { confirmPayment } = useStripe();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [displayAmount, setDisplayAmount] = useState(null);
  const [alertInfo, setAlertInfo] = useState(null);

  const showAlert = (title, message) => setAlertInfo({ title, message });

  const pollStatus = async (intentId) => {
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const res = await apiFetch(`/api/payments/status/${intentId}`);
      const json = await res.json();
      if (json.data?.status === "paid") return true;
      if (json.data?.status === "failed" || json.data?.status === "cancelled") return false;
    }
    return false;
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/payments/intent`, {
        method: "POST",
        body: JSON.stringify({ payable_type: payableType, payable_id: payableId }),
      });
      const json = await res.json();

      if (res.status === 409) {
        showAlert(t("payment.processing"), json.message);
        onSuccess?.();
        return;
      }
      if (res.status === 403) {
        showAlert(t("payment.error"), json.message);
        return;
      }
      if (res.status === 422) {
        showAlert(t("payment.error"), json.message);
        return;
      }
      if (res.status === 502) {
        showAlert(t("payment.error"), json.message);
        return;
      }
      if (res.status !== 200 && res.status !== 201) {
        showAlert(t("payment.error"), json.message || t("payment.connectionError"));
        return;
      }

      const { client_secret, payment_intent_id } = json.data;
      if (json.data.amount != null) {
        setDisplayAmount(`${(json.data.amount / 100).toFixed(2)} ${json.data.currency}`);
      }

      const { error } = await confirmPayment(client_secret, {
        paymentMethodType: "Card",
      });
      if (error) {
        showAlert(t("payment.failed"), error.message);
        return;
      }

      const confirmed = await pollStatus(payment_intent_id);
      if (confirmed) {
        onSuccess?.();
      } else {
        showAlert(t("payment.processing"), t("payment.processingHint"));
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      }
    } catch (e) {
      showAlert(t("payment.error"), t("payment.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {displayAmount && (
        <Text style={styles.amountText}>{displayAmount}</Text>
      )}
      <CardField
        postalCodeEnabled={false}
        placeholders={{ number: "4242 4242 4242 4242" }}
        style={styles.cardField}
        onCardChange={(d) => setCardComplete(d.complete)}
      />
      <TouchableOpacity
        onPress={handlePay}
        disabled={!cardComplete || loading}
        style={[styles.payBtn, (!cardComplete || loading) && styles.payBtnDisabled]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payBtnText}>{t("payment.payNow")}</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={!!alertInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setAlertInfo(null)}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>{alertInfo?.title}</Text>
            <Text style={styles.alertMessage}>{alertInfo?.message}</Text>
            <TouchableOpacity
              onPress={() => setAlertInfo(null)}
              style={styles.alertBtn}
            >
              <Text style={styles.alertBtnText}>{t("common.ok", "OK")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  amountText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#052443",
    textAlign: "center",
  },
  cardField: {
    width: "100%",
    height: 50,
  },
  payBtn: {
    backgroundColor: "#052443",
    padding: 14,
    borderRadius: 10,
  },
  payBtnDisabled: {
    opacity: 0.4,
  },
  payBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 22,
    width: "85%",
    maxWidth: 340,
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#052443",
    marginBottom: 8,
    textAlign: "center",
  },
  alertMessage: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 20,
  },
  alertBtn: {
    backgroundColor: "#052443",
    paddingVertical: 10,
    borderRadius: 8,
  },
  alertBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});