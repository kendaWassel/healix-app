// components/common/DoneModal.js
import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DoneModal({ isOpen, onClose, onHome, message = "You Are Done" }) {
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{message}</Text>

          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
            </View>
          </View>

          <TouchableOpacity onPress={onHome} style={styles.homeBtn}>
            <Text style={styles.homeBtnText}>Go to Home Screen</Text>
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