import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import PhysioHeader from "../../Components/header/PhysioHeader";
import Footer from "../../Components/footer/Footer";
import { colors } from "../../../constants/colors";
import { BASE_URL, NGROK_HEADERS } from "../../../constants/api";
import { getCurrentCoords } from "../../../utils/getCurrentCoords";
import i18n from "../../../i18n/i18n";

const PhysioNewOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptingOrderId, setAcceptingOrderId] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

const fetchOrders = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const { latitude, longitude } = await getCurrentCoords();
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(
      `${BASE_URL}/provider/physiotherapist/nearby-requests?latitude=${latitude}&longitude=${longitude}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...NGROK_HEADERS,
          Authorization: `Bearer ${token}`,
    "Accept-Language": i18n.language,

        },
      },
    );

    if (!response.ok) {
      const serverError = await response.json().catch(() => ({}));
      throw new Error(serverError.message || "Request failed");
    }

    const result = await response.json();
    console.log("Nearby requests fetched:", result);

    setOrders(Array.isArray(result.data) ? result.data : []);
  } catch (err) {
    console.error("Failed fetching orders:", err);
    if (err.message === "LOCATION_PERMISSION_DENIED") {
      setError(t("physioNewOrders.locationPermissionDenied"));
    } else {
      setError(err.message || t("physioNewOrders.loadFail"));
    }
  } finally {
    setIsLoading(false);
  }
};

  const handleAccept = async (sessionId) => {
    setAcceptingOrderId(sessionId);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/provider/physiotherapist/orders/${sessionId}/accept`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
    "Accept-Language": i18n.language,

          },
        },
      );

      const result = await response.json();

      if (result.status === "success") {
        setModalMessage(result.message);
        setIsModalOpen(true);
      } else {
        console.error("Failed to accept order", result.message);
        setModalMessage(result.message || t("physioNewOrders.acceptFail"));
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      setModalMessage(t("physioNewOrders.acceptError"));
      setIsModalOpen(true);
    } finally {
      setAcceptingOrderId(null);
      fetchOrders();
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.patient_name}</Text>

          <View style={styles.addressRow}>
            <FontAwesome5
              name="map-marker-alt"
              size={16}
              color={colors.cyan}
            />
            <Text style={styles.addressText}>{item.address}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleAccept(item.session_id)}
          disabled={acceptingOrderId === item.session_id || !!acceptingOrderId}
          style={styles.acceptTextBtn}
        >
          <Text
            style={[
              styles.acceptText,
              !!acceptingOrderId && styles.acceptTextDisabled,
            ]}
          >
            {acceptingOrderId === item.session_id
              ? t("physioNewOrders.accepting")
              : t("physioNewOrders.accept")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hr} />

      <View style={styles.footerRow}>
        <View style={styles.timeRow}>
          <FontAwesome5 name="walking" size={16} color={colors.cyan} />
          <Text style={styles.timeText}>
            {t("physioNewOrders.distanceKm", { distance: item.distance_km })}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <PhysioHeader />
      <View style={styles.container}>
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.title}>{t("physioNewOrders.title")}</Text>
          <Text style={styles.subtitle}>{t("physioNewOrders.subtitle")}</Text>
        </View>

        {isLoading && (
          <Text style={styles.centerText}>{t("physioNewOrders.loading")}</Text>
        )}

        {!isLoading && orders.length === 0 && (
          <Text style={styles.centerText}>
            {error || t("physioNewOrders.noOrders")}
          </Text>
        )}

        <FlatList
          data={orders}
          style={styles.order}
          keyExtractor={(item) => String(item.session_id)}
          renderItem={renderCard}
          contentContainerStyle={{ gap: 16 }}
        />
      </View>

      {/* was: a fixed inset-0 overlay <div> — RN Modal is the native way
          to do an overlay/popup */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setIsModalOpen(false)}
            >
              <Text style={styles.cancelBtnText}>
                {t("physioNewOrders.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Footer />
    </View>
  );
};

export default PhysioNewOrders;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.gray50 },
  title: { fontSize: 26, fontWeight: "bold", color: "#0a3460" },
  subtitle: { color: colors.gray500, marginTop: 6 },
  order: { marginBottom: 20 },
  centerText: { textAlign: "center", color: colors.gray500, marginBottom: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.darkBlue,
    marginBottom: 8,
  },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  addressText: { fontSize: 13, color: colors.darkBlue, fontWeight: "500" },
  acceptTextBtn: { paddingLeft: 8 },
  acceptText: { color: "#16a34a", fontWeight: "600" },
  acceptTextDisabled: { opacity: 0.5 },
  hr: { height: 1, backgroundColor: colors.gray200, marginVertical: 12 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  timeText: { fontSize: 13, color: colors.gray700 },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.black40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: colors.white,
    width: "90%",
    maxWidth: 360,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalMessage: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray800,
    textAlign: "center",
    marginBottom: 20,
  },
  cancelBtn: {
    backgroundColor: colors.darkBlue,
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  cancelBtnText: { color: colors.white, fontWeight: "600" },
});