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

import NurseHeader from "../../Components/header/NurseHeader";
import Footer from "../../Components/footer/Footer";
import { colors } from "../../../constants/colors";
import { BASE_URL, NGROK_HEADERS } from "../../../constants/api";

const NurseNewOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptingOrderId, setAcceptingOrderId] = useState(null);
  const [error, setError] = useState(null);
  const [current_page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState(
    t("nurse.nurseNewOrders.orderAccepted"),
  );

  const fetchOrders = async (pageNumber = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/provider/nurse/orders?page=${pageNumber}&per_page=6`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || "Request failed");
      }

      const data = await response.json();
      console.log("Orders Fetched:", data);
      setPage(data.meta.current_page);
      setTotal(data.meta.last_page);
      if (data.status === "success" && Array.isArray(data.data)) {
        setOrders(data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Failed fetching orders:", err);
      setError(err.message || "Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleNext = () => {
    if (current_page < total) fetchOrders(current_page + 1);
  };

  const handlePrevious = () => {
    if (current_page > 1) fetchOrders(current_page - 1);
  };

  const handleAccept = async (id) => {
    setAcceptingOrderId(id);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/provider/nurse/orders/${id}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (data.status === "success") {
        setModalMessage(data.message);
        setIsModalOpen(true);
        fetchOrders();
      } else {
        console.error(" Failed to accept order", data.message);
        setModalMessage(data.message || "Failed to accept order");
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error(" Error accepting order:", err);
      setModalMessage("Error accepting order. Please try again.");
      setIsModalOpen(true);
    } finally {
      setAcceptingOrderId(null);
      fetchOrders();
    }
  };

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.patientName}>{item.patient_name}</Text>
          <View style={styles.serviceRow}>
            <Text style={styles.serviceLabel}>
              {t("nurse.nurseNewOrders.service")}
            </Text>
            <Text style={styles.serviceValue}>{item.service}</Text>
          </View>
          <View style={styles.addressRow}>
            <FontAwesome5
              name="map-marker-alt"
              size={14}
              color={colors.darkBlue}
            />
            <Text style={styles.addressText}>{item.address}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleAccept(item.session_id)}
          disabled={
            acceptingOrderId === item.session_id ||
            (acceptingOrderId !== null && acceptingOrderId !== item.session_id)
          }
        >
          <Text style={styles.acceptText}>
            {acceptingOrderId === item.session_id
              ? t("nurse.nurseNewOrders.accepting")
              : t("nurse.nurseNewOrders.accept")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hr} />

      <View style={styles.cardBottomRow}>
        <View style={styles.timeRow}>
          <FontAwesome5 name="clock" size={16} color={colors.cyan} />
          <Text style={styles.timeText}>
            {new Date(item.scheduled_at).toLocaleString()}
          </Text>
        </View>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <NurseHeader />
      <View style={styles.container}>
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.title}>{t("nurse.nurseNewOrders.title")}</Text>
          <Text style={styles.subtitle}>{t("nurse.nurseNewOrders.subtitle")}</Text>
        </View>

        {isLoading ? (
          <Text style={styles.centerText}>{t("nurse.nurseNewOrders.loading")}</Text>
        ) : orders.length > 0 ? (
          <FlatList
            data={orders}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderCard}
            contentContainerStyle={{ gap: 16, marginBottom: 20 }}
          />
        ) : error ? (
          <Text style={[styles.centerText, { color: colors.danger }]}>
            {error}
          </Text>
        ) : (
          <Text style={styles.centerText}>{t("nurse.nurseNewOrders.noOrders")}</Text>
        )}

        <View style={styles.pagination}>
          <TouchableOpacity
            style={styles.pageBtn}
            onPress={handlePrevious}
            disabled={current_page === 1 || isLoading || !!error}
          >
            <Text style={styles.pageBtnText}>
              {t("nurse.nurseNewOrders.previous")}
            </Text>
          </TouchableOpacity>

          <Text style={styles.pageOfText}>
            {t("nurse.nurseNewOrders.pageOf", { page: current_page, total })}
          </Text>

          <TouchableOpacity
            style={styles.pageBtn}
            onPress={handleNext}
            disabled={current_page === total || isLoading || !!error}
          >
            <Text style={styles.pageBtnText}>{t("nurse.nurseNewOrders.next")}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Footer />

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
              style={styles.modalCancelBtn}
              onPress={() => setIsModalOpen(false)}
            >
              <Text style={styles.modalCancelText}>
                {t("nurseNewOrders.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default NurseNewOrders;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.gray50 },
  title: { fontSize: 26, fontWeight: "bold", color: "#0a3460" },
  subtitle: { color: colors.gray500, marginTop: 6, fontSize: 15 },
  centerText: {
    textAlign: "center",
    color: colors.gray500,
    marginVertical: 16,
  },
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
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  patientName: { fontSize: 18, fontWeight: "600", color: colors.darkBlue },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginVertical: 8,
  },
  serviceLabel: { color: colors.cyan, fontSize: 14 },
  serviceValue: { color: colors.textColor, fontWeight: "700", fontSize: 14 },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  addressText: { color: colors.darkBlue, fontSize: 13, fontWeight: "500" },
  acceptText: { color: colors.success, fontWeight: "600" },
  hr: { height: 1, backgroundColor: colors.gray200, marginVertical: 14 },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  timeText: { fontSize: 13, color: colors.gray700 },
  statusText: { color: colors.gray700, fontSize: 13 },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
  },
  pageBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cyan,
  },
  pageBtnText: { color: colors.cyan, fontWeight: "500" },
  pageOfText: { fontWeight: "600", color: colors.gray700 },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.black40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: colors.white,
    width: "90%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  modalMessage: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.gray800,
    marginBottom: 24,
    textAlign: "center",
  },
  modalCancelBtn: {
    backgroundColor: "#001f3f",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  modalCancelText: { color: colors.white, fontWeight: "600" },
});
