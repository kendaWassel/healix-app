import { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

export default function MapPicker({ visible, initialPosition, onConfirm, onClose }) {
  const [position, setPosition] = useState(
    Array.isArray(initialPosition) ? initialPosition : null
  );

  const initialRegion = {
    latitude: position ? position[0] : 33.5138,
    longitude: position ? position[1] : 36.2765,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Pick your location</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color="#333" />
          </TouchableOpacity>
        </View>

        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setPosition([latitude, longitude]);
          }}
        >
          {position && (
            <Marker coordinate={{ latitude: position[0], longitude: position[1] }} />
          )}
        </MapView>

        <View style={styles.footer}>
          <Text style={styles.coords}>
            {position
              ? `Selected: ${position[0].toFixed(6)}, ${position[1].toFixed(6)}`
              : "Tap on the map to choose a point"}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !position && styles.disabledBtn]}
              disabled={!position}
              onPress={() => position && onConfirm(position[0], position[1])}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: "#eee",
  },
  title: { fontSize: 17, fontWeight: "600" },
  map: { flex: 1 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: "#eee" },
  coords: { fontSize: 12, color: "#555", marginBottom: 12 },
  buttonRow: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1, backgroundColor: "#f3f4f6", padding: 12,
    borderRadius: 8, alignItems: "center",
  },
  cancelText: { color: "#111827", fontWeight: "600" },
  confirmBtn: {
    flex: 1, backgroundColor: "#2563eb", padding: 12,
    borderRadius: 8, alignItems: "center",
  },
  disabledBtn: { backgroundColor: "#93c5fd" },
  confirmText: { color: "#fff", fontWeight: "600" },
});