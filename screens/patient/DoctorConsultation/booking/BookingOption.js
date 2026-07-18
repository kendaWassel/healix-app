// components/booking/BookingOption.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BookingOption({ isOpen, onClose, onConfirm, isLoading }) {
  const [selectedOption, setSelectedOption] = useState("Call Now");
  const options = ["Call Now", "Schedule For later"];

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Pick one</Text>

          <View style={styles.optionsWrapper}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setSelectedOption(option)}
                style={[
                  styles.optionRow,
                  selectedOption === option && styles.optionRowSelected,
                ]}
              >
                <Text style={styles.optionText}>{option}</Text>
                <View
                  style={[
                    styles.radioOuter,
                    selectedOption === option && styles.radioOuterSelected,
                  ]}
                >
                  {selectedOption === option && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonsRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(selectedOption)}
              disabled={isLoading}
              style={[styles.confirmBtn, isLoading && styles.btnDisabled]}
            >
              <Text style={styles.confirmBtnText}>
                {isLoading ? "Processing..." : "Confirm"}
              </Text>
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
    padding: 28,
    width: "90%",
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
  },
  optionsWrapper: {
    gap: 14,
    marginBottom: 28,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionRowSelected: {
    borderColor: "#0e7490",
    backgroundColor: "#ecfeff",
  },
  optionText: {
    color: "#1f2937",
    fontWeight: "500",
    fontSize: 15,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: "#0e7490",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0e7490",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelBtnText: {
    color: "#374151",
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#001f3f",
  },
  confirmBtnText: {
    color: "#fff",
    fontWeight: "500",
  },
  btnDisabled: {
    opacity: 0.5,
  },
});