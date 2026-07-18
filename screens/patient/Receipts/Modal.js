// screens/patient/Receipts/Modal.js
import React from "react";
import { View, TouchableOpacity, Modal as RNModal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Modal({ open, onClose, children }) {
  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Ionicons name="close" size={22} color="#374151" />
          </TouchableOpacity>
          {children}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    width: "90%",
    maxWidth: 420,
    maxHeight: "85%",
  },
  closeIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
});