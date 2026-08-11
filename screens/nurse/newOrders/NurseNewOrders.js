import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import NurseHeader from "../../Components/header/NurseHeader";
import Footer from "../../Components/footer/Footer";
import { colors } from "../../../constants/colors";
import { getCurrentCoords } from "../../../utils/getCurrentCoords";
import { apiFetch } from "../../../utils/apiClient";
import { BASE_URL, NGROK_HEADERS } from "../../../constants/api";
import i18n from "../../../i18n/i18n";

const NurseNewOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptingOrderId, setAcceptingOrderId] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState(
    t("nurse.nurseNewOrders.orderAccepted"),
  );

    const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  });
const fetchOrders = async (pageNumber = 1) => {
  setIsLoading(true);
  setError(null);

  try {
    const { latitude, longitude } = await getCurrentCoords();

      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/provider/nurse/nearby-requests?latitude=${latitude}&longitude=${longitude}&page=${pageNumber}&per_page=${pagination.perPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
    "Accept-Language": i18n.language,

          },
        },
      );

    const data = await response.json();

    console.log("Nearby requests fetched:", data);

    setOrders(Array.isArray(data.data) ? data.data : []);
      if (data.meta) {
        setPagination((prev) => ({
          ...prev,
          currentPage: data.meta.current_page,
          lastPage: data.meta.last_page,
          total: data.meta.total,
        }));
      }

  } catch (err) {
    console.error("Failed fetching orders:", err);

    if (err.message === "LOCATION_PERMISSION_DENIED") {
      setError(t("nurse.nurseNewOrders.locationPermissionDenied"));
    } else {
      setError(err.message || t("nurse.nurseNewOrders.loadFailed"));
    }
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchOrders(1);
  }, []);

    const handleNextPage = () => {
    if (pagination.currentPage < pagination.lastPage) {
      fetchOrders(pagination.currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      fetchOrders(pagination.currentPage - 1);
    }
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
    "Accept-Language": i18n.language,

          },
        },
      );

    const data = await response.json();

    if (data.status === "success") {
      setModalMessage(
        data.message || t("nurse.nurseNewOrders.orderAccepted")
      );
      setIsModalOpen(true);
    } else {
      console.error("Failed to accept order:", data.message);

      setModalMessage(
        data.message || t("nurse.nurseNewOrders.acceptFailed")
      );
      setIsModalOpen(true);
    }
  } catch (err) {
    console.error("Error accepting order:", err);

    setModalMessage(t("nurse.nurseNewOrders.acceptError"));
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
          <FontAwesome5 name="walking" size={16} color={colors.cyan} />
          <Text style={styles.timeText}>
            {t("nurse.nurseNewOrders.distanceKm", { distance: item.distance_km })}
          </Text>
        </View>
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
            keyExtractor={(item) => String(item.session_id)}
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
            style={[
              styles.pageBtn,
              pagination.currentPage === 1 && styles.pageBtnDisabled,
            ]}
            onPress={handlePrevPage}
            disabled={pagination.currentPage === 1 || isLoading}
          >
            <Text
              style={[
                styles.pageBtnText,
                pagination.currentPage === 1 && styles.pageBtnTextDisabled,
              ]}
            >
              {t("nurse.nurseNewOrders.previous")}
            </Text>
          </TouchableOpacity>

          <Text style={styles.pageOfText}>
            {t("nurse.nurseNewOrders.pageOf", {
              page: pagination.currentPage,
              total: pagination.lastPage,
            })}
          </Text>

          <TouchableOpacity
            style={[
              styles.pageBtn,
              pagination.currentPage === pagination.lastPage && styles.pageBtnDisabled,
            ]}
            onPress={handleNextPage}
            disabled={pagination.currentPage === pagination.lastPage || isLoading}
          >
            <Text
              style={[
                styles.pageBtnText,
                pagination.currentPage === pagination.lastPage &&
                  styles.pageBtnTextDisabled,
              ]}
            >
              {t("nurse.nurseNewOrders.next")}
            </Text>
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
                {t("nurse.nurseNewOrders.cancel")}
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
  pageBtnDisabled: { borderColor: colors.gray300 },
  pageBtnText: { color: colors.cyan, fontWeight: "500" },
  pageBtnTextDisabled: { color: colors.gray500 },
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