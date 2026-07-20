import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import DeliveryHeader from "../../Components/header/DeliveryHeader";
import Footer from "../../Components/footer/Footer";
import { colors } from "../../../constants/colors";
import { BASE_URL, NGROK_HEADERS } from "../../../constants/api";

export default function MyOrders() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderId, setOrderId] = useState(null);

  const fetchMyTasks = async (pageNumber = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      let url = `${BASE_URL}/delivery/tasks?page=${pageNumber}&per_page=3`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          ...NGROK_HEADERS,
        },
      });

      if (!response.ok) throw new Error("Request failed");

      const data = await response.json();
      console.log("Orders :", data);

      setTasks(data.data || []);
      setPage(data.meta.current_page);
      setTotal(data.meta.last_page);
    } catch (err) {
      setError(t("myOrders.loadFail"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks(1);
  }, [statusFilter]);

  const setAsDelivered = async (task_id, currentStatus) => {
    setOrderId(task_id);
    setLoadingStatus(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/delivery/tasks/${task_id}/update-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...NGROK_HEADERS,
          },
          body: JSON.stringify({ status: getNextStatus(currentStatus) }),
        },
      );
      if (!response.ok) throw new Error("Request Failed");
      const data = await response.json();
      console.log("Updated Status :", data);
      Alert.alert(t("myOrders.updateSuccess"));
      fetchMyTasks(page);
    } catch (err) {
      setError(t("myOrders.updateFail"));
    } finally {
      setLoadingStatus(false);
      setOrderId(null);
    }
  };

  const getNextStatus = (status) => {
    if (status === "pending") return "picking_up_the_order";
    if (status === "picking_up_the_order") return "on_the_way";
    if (status === "on_the_way") return "delivered";
    return status;
  };

  const formatStatus = (status) => {
    switch (status) {
      case "pending":
        return t("myOrders.statusPending");
      case "picking_up_the_order":
        return t("myOrders.statusPicking");
      case "on_the_way":
        return t("myOrders.statusOnWay");
      case "delivered":
        return t("myOrders.statusDelivered");
      default:
        return status;
    }
  };

  const handleNext = () => {
    if (page < total) fetchMyTasks(page + 1);
  };
  const handlePrevious = () => {
    if (page > 1) fetchMyTasks(page - 1);
  };

  const renderActionButton = (task) => {
    const isThisLoading = loadingStatus && orderId === task.task_id;
    if (task.status === "pending") {
      return (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setAsDelivered(task.task_id, task.status)}
          disabled={loadingStatus}
        >
          <Text style={styles.actionBtnText}>
            {isThisLoading
              ? t("myOrders.settingPickingUp")
              : t("myOrders.setPickingUp")}
          </Text>
        </TouchableOpacity>
      );
    }
    if (task.status === "picking_up_the_order") {
      return (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setAsDelivered(task.task_id, task.status)}
          disabled={loadingStatus}
        >
          <Text style={styles.actionBtnText}>
            {isThisLoading
              ? t("myOrders.settingOnWay")
              : t("myOrders.setOnWay")}
          </Text>
        </TouchableOpacity>
      );
    }
    if (task.status === "on_the_way") {
      return (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setAsDelivered(task.task_id, task.status)}
          disabled={loadingStatus}
        >
          <Text style={styles.actionBtnText}>
            {isThisLoading
              ? t("myOrders.settingDelivered")
              : t("myOrders.setDelivered")}
          </Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderCard = ({ item: task }) => (
    <View style={styles.card}>
      <Text style={styles.cardHeading}>
        {t("myOrders.pharmacy")} {task.pharmacy_name}
      </Text>
      <Text style={styles.line}>
        <Text style={styles.cyanLabel}>{t("myOrders.pharmacistPhone")} </Text>
        <Text style={styles.grayValue}>{task.pharmacy_phone}</Text>
      </Text>
      <Text style={styles.line}>
        <Text style={styles.cyanLabel}>{t("myOrders.address")} </Text>
        <Text style={styles.grayValue}>{task.pharmacy_address}</Text>
      </Text>

      <View style={styles.divider} />

      <Text style={styles.cardHeading}>
        {t("myOrders.patient")} {task.patient_name}
      </Text>
      <Text style={styles.line}>
        <Text style={styles.cyanLabel}>{t("myOrders.phone")} </Text>
        <Text style={styles.grayValue}>{task.patient_phone}</Text>
      </Text>
      <Text style={styles.line}>
        <Text style={styles.cyanLabel}>{t("myOrders.patientAddress")} </Text>
        <Text style={styles.grayValue}>{task.patient_address}</Text>
      </Text>

      <Text style={styles.statusText}>
        {t("myOrders.status", { status: formatStatus(task.status) })}
      </Text>

      {renderActionButton(task)}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <DeliveryHeader />
      <View style={styles.container}>
        <Text style={styles.title}>{t("myOrders.title")}</Text>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              statusFilter === "all" && styles.filterBtnActive,
            ]}
            onPress={() => setStatusFilter("all")}
            disabled={isLoading || !!error}
          >
            <Text
              style={[
                styles.filterBtnText,
                statusFilter === "all" && styles.filterBtnTextActive,
              ]}
            >
              {t("myOrders.allOrders")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              statusFilter === "delivered" && styles.filterBtnActive,
            ]}
            onPress={() => setStatusFilter("delivered")}
            disabled={isLoading || !!error}
          >
            <Text
              style={[
                styles.filterBtnText,
                statusFilter === "delivered" && styles.filterBtnTextActive,
              ]}
            >
              {t("myOrders.delivered")}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>{t("myOrders.subtitle")}</Text>

        {isLoading ? (
          <Text style={styles.centerText}>{t("myOrders.loading")}</Text>
        ) : error ? (
          <Text style={[styles.centerText, { color: colors.danger }]}>
            {error}
          </Text>
        ) : tasks.length > 0 ? (
          <FlatList
            data={tasks}
            keyExtractor={(item) => String(item.task_id)}
            renderItem={renderCard}
            contentContainerStyle={{ gap: 16, paddingVertical: 16 }}
          />
        ) : (
          <Text style={styles.centerText}>{t("myOrders.noOrders")}</Text>
        )}

        <View style={styles.pagination}>
          <TouchableOpacity
            style={styles.pageBtn}
            onPress={handlePrevious}
            disabled={page === 1}
          >
            <FontAwesome5
              name="chevron-left"
              size={12}
              color={colors.gray700}
            />
            <Text style={styles.pageBtnText}> {t("myOrders.prev")}</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 13 }}>
            {t("myOrders.pageOf", { page, total })}
          </Text>

          <TouchableOpacity
            style={styles.pageBtn}
            onPress={handleNext}
            disabled={page === total}
          >
            <Text style={styles.pageBtnText}>{t("myOrders.next")} </Text>
            <FontAwesome5
              name="chevron-right"
              size={12}
              color={colors.gray700}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#002244",
    marginBottom: 16,
  },
  filterRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  filterBtnActive: {
    backgroundColor: colors.darkBlue,
    borderColor: colors.darkBlue,
  },
  filterBtnText: { fontWeight: "600", color: colors.gray700 },
  filterBtnTextActive: { color: colors.white },
  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.gray500,
    marginBottom: 8,
  },
  centerText: {
    textAlign: "center",
    color: colors.gray500,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 16,
    padding: 18,
  },
  cardHeading: {
    fontSize: 18,
    color: colors.darkBlue,
    fontWeight: "bold",
    marginBottom: 4,
  },
  line: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  cyanLabel: { color: colors.cyan },
  grayValue: { color: colors.textColor },
  divider: { height: 1, backgroundColor: colors.gray300, marginVertical: 12 },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0e7490",
    marginVertical: 10,
  },
  actionBtn: {
    backgroundColor: colors.darkBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  actionBtnText: { color: colors.white, fontWeight: "600" },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 16,
  },
  pageBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  pageBtnText: { fontSize: 13, color: colors.gray700 },
});
