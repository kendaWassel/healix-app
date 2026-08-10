import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function LastLocationMapModal({
  visible,
  onClose,
  loading,
  error,
  location,
}) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{t("myOrders.lastLocationTitle")}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#39CCCC" />
            </View>
          ) : error ? (
            <View style={styles.centerBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : location ? (
            <>
              <MapView
                style={styles.map}
                region={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title={t("myOrders.yourLastLocation")}
                />
              </MapView>

              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.onlineDot,
                    { backgroundColor: location.is_online ? "#22c55e" : "#9ca3af" },
                  ]}
                />
                <Text style={styles.statusText}>
                  {location.is_online
                    ? t("myOrders.youAreOnline")
                    : t("myOrders.youAreOffline")}
                </Text>
              </View>
              <Text style={styles.updatedText}>
                {t("myOrders.updatedAt")}:{" "}
                {new Date(location.updated_at).toLocaleTimeString()}
              </Text>
            </>
          ) : (
            <View style={styles.centerBox}>
              <Text style={styles.emptyText}>{t("myOrders.noLocationYet")}</Text>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "92%",
    maxWidth: 460,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 17, fontWeight: "700", color: "#0a3460" },
  map: {
    width: "100%",
    height: 320,
    borderRadius: 12,
  },
  centerBox: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: { color: "#dc2626", textAlign: "center" },
  emptyText: { color: "#6b7280", textAlign: "center" },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  onlineDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontWeight: "600", color: "#111827" },
  updatedText: { fontSize: 12, color: "#6b7280", marginTop: 4 },
});