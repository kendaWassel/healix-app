// screens/patient/Receipts/YouAreDone.js
import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function YouAreDone({ isOpen, onClose, onHome }) {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleGoHome = () => {
    if (onHome) {
      onHome();
    } else {
      navigation.navigate("PatientHome");
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{t("youAreDone.title")}</Text>

          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
            </View>
          </View>

          <TouchableOpacity onPress={handleGoHome} style={styles.homeBtn}>
            <Text style={styles.homeBtnText}>{t("youAreDone.goHome")}</Text>
          </TouchableOpacity>
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
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 24,
    textAlign: "center",
  },
  iconWrapper: {
    marginBottom: 28,
  },
  iconCircle: {
    backgroundColor: "#dcfce7",
    padding: 16,
    borderRadius: 999,
  },
  homeBtn: {
    width: "100%",
    backgroundColor: "#001f3f",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  homeBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});