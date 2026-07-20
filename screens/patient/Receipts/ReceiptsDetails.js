import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";

const ReceiptDetails = ({ open, onClose, prescription_id }) => {
  const { t } = useTranslation();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !prescription_id) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await AsyncStorage.getItem("token");

        const response = await fetch(
          `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patient/prescriptions/${prescription_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        console.log("receipt details: ", data);
        if (data.status === "success") {
          setReceipt(data.data);
        } else {
          setError(t("receiptDetails.loadFailed"));
        }
      } catch (err) {
        setError(t("receiptDetails.networkError"));
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [open, prescription_id]);

  return (
    <Modal open={open} onClose={onClose}>
      <Text style={styles.title}>{t("receiptDetails.title")}</Text>

      {loading && (
        <ActivityIndicator size="large" color="#39CCCC" style={{ marginVertical: 20 }} />
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {receipt && (
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {receipt.prescription_image_url ? (
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: receipt.prescription_image_url }}
                style={styles.prescriptionImage}
                resizeMode="contain"
              />
              <Text style={styles.imageCaption}>{t("receiptDetails.uploadedImageCaption")}</Text>
            </View>
          ) : (
            <>
              <View style={{ gap: 4 }}>
                <Text style={styles.infoLine}>
                  <Text style={styles.infoLabel}>{t("receiptDetails.doctor")} </Text>
                  {receipt.doctor_name}
                </Text>
                <Text style={styles.infoLine}>
                  <Text style={styles.infoLabel}>{t("receiptDetails.diagnosis")} </Text>
                  {receipt.diagnosis}
                </Text>
                <Text style={styles.infoLine}>
                  <Text style={styles.infoLabel}>{t("receiptDetails.notes")} </Text>
                  {receipt.notes}
                </Text>
                <Text style={styles.infoLine}>
                  <Text style={styles.infoLabel}>{t("receiptDetails.status")} </Text>
                  {receipt.status}
                </Text>
              </View>

              <View style={styles.divider} />
              <Text style={styles.medicinesTitle}>{t("receiptDetails.medicinesTitle")}</Text>
              {receipt.medicines?.map((med, index) => (
                <View key={index} style={styles.medicineCard}>
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoLabel}>{t("receiptDetails.name")} </Text>
                    {med.name}
                  </Text>
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoLabel}>{t("receiptDetails.dosage")} </Text>
                    {med.dosage}
                  </Text>
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoLabel}>{t("receiptDetails.quantity")} </Text>
                    {med.quantity}
                  </Text>
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoLabel}>{t("receiptDetails.instructions")} </Text>
                    {med.instructions}
                  </Text>
                </View>
              ))}
            </>
          )}

          <View style={styles.footerRow}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>{t("receiptDetails.close")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </Modal>
  );
};

export default ReceiptDetails;

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0A2A4A",
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
  },
  scrollArea: {
    maxHeight: 420,
  },
  imageWrapper: {
    alignItems: "center",
    gap: 12,
  },
  prescriptionImage: {
    width: "100%",
    height: 320,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  imageCaption: {
    fontSize: 12,
    color: "#6b7280",
  },
  infoLine: {
    fontSize: 14,
    color: "#374151",
  },
  infoLabel: {
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 14,
  },
  medicinesTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  medicineCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 2,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  closeBtn: {
    borderWidth: 1,
    borderColor: "#0A2A4A",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  closeBtnText: {
    color: "#0A2A4A",
    fontWeight: "600",
  },
});