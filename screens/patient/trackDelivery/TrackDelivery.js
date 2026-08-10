import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import PatientHeader from "../../Components/header/PatientHeader";
import useTrackDeliveryLocation from "../../Components/common/useTrackDeliveryLocation";

export default function TrackDelivery({ route, navigation }) {
  const { t } = useTranslation();
  const { taskId } = route.params;
  const { location, isLoading, error } = useTrackDeliveryLocation(taskId);

  return (
    <View style={{ flex: 1 }}>
      <PatientHeader />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0a3460" />
        </TouchableOpacity>
        <Text style={styles.title}>{t("trackDelivery.title")}</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#39CCCC" />
          <Text style={styles.centerText}>{t("trackDelivery.loading")}</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : location ? (
        <>
          <MapView
            style={{ flex: 1 }}
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
              title={t("trackDelivery.driverMarkerTitle")}
            />
          </MapView>

          <View style={styles.statusBar}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.onlineDot,
                  { backgroundColor: location.is_online ? "#22c55e" : "#9ca3af" },
                ]}
              />
              <Text style={styles.statusText}>
                {location.is_online
                  ? t("trackDelivery.driverOnline")
                  : t("trackDelivery.driverOffline")}
              </Text>
            </View>
            <Text style={styles.updatedText}>
              {t("trackDelivery.lastUpdated")}{" "}
              {new Date(location.updated_at).toLocaleTimeString()}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.centerBox}>
          <Text style={styles.centerText}>{t("trackDelivery.noLocationYet")}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: "700", color: "#0a3460" },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  centerText: { marginTop: 10, color: "#4b5563" },
  errorText: { color: "#dc2626", textAlign: "center" },
  statusBar: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  onlineDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontWeight: "600", color: "#111827" },
  updatedText: { marginTop: 4, fontSize: 12, color: "#6b7280" },
});