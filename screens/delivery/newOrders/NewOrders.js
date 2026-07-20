import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
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

const NewOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [price, setPrice] = useState("");
  const [showAcceptPopup, setShowAcceptPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchOrders = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/delivery/new-orders?page=${pageNumber}&per_page=6`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Request failed");

      const result = await response.json();

      if (result.status === "success") {
        const mappedOrders = result.data.map((item) => ({
          order_id: item.order_id,
          order_price: item.order_price,
          task_id: item.task_id,
          pharmacy_name: item.pharmacy.name,
          pharmacy_address: item.pharmacy.address,
          patient_address: item.patient_address,
        }));

        console.log("Orders:", result);
        setOrders(mappedOrders);
        setPage(result.meta.current_page);
        setLastPage(result.meta.last_page);
      }
    } catch (error) {
      console.error("Error fetching delivery orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!selectedItem) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/delivery/new-orders/${selectedItem.order_id}/accept`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      if (result.status === "success") {
        console.log("Accepted result:", result);
        const task_id = result.data.task_id;
        await sendPrice(task_id);

        setOrders((prev) =>
          prev.filter((o) => o.order_id !== selectedItem.order_id),
        );
        setShowAcceptPopup(false);
        setSelectedItem(null);
        setPrice("");

        Alert.alert(t("newOrders.acceptSuccess"));
      }
    } catch (error) {
      console.error("Error accepting order:", error);
    }
  };

  const sendPrice = async (task_id) => {
    setSaveLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/delivery/tasks/${task_id}/set-delivery-fee`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ delivery_fee: Number(price) }),
        },
      );
      const result = await response.json();
      console.log("sending price: ", result);
      if (!response.ok)
        throw new Error(result.message || t("newOrders.priceAddFail"));
      Alert.alert(t("newOrders.priceAddSuccess"));
    } catch (error) {
      console.error("Error sending price:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const isSaveDisabled = () => !price || Number(price) <= 0;

  const renderCard = ({ item: order }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{order.pharmacy_name}</Text>

      <View style={styles.addressRow}>
        <FontAwesome5 name="map-marker-alt" size={16} color={colors.cyan} />
        <Text style={styles.addressText}>{order.pharmacy_address}</Text>
      </View>

      <Text style={styles.deliverToText}>
        {t("newOrders.deliverTo")} {order.patient_address}
      </Text>

      <View style={styles.hr} />

      <TouchableOpacity
        style={styles.acceptBtn}
        onPress={() => {
          setSelectedItem(order);
          setShowAcceptPopup(true);
        }}
      >
        <Text style={styles.acceptBtnText}>{t("newOrders.accept")}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <DeliveryHeader />
      <View style={styles.container}>
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.title}>{t("newOrders.title")}</Text>
          <Text style={styles.subtitle}>{t("newOrders.subtitle")}</Text>
        </View>

        {loading && (
          <Text style={styles.centerText}>{t("newOrders.loading")}</Text>
        )}

        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.order_id)}
          renderItem={renderCard}
          contentContainerStyle={{ gap: 16 }}
        />

        <View style={styles.pagination}>
          <TouchableOpacity
            style={styles.pageBtn}
            disabled={page === 1}
            onPress={() => setPage(page - 1)}
          >
            <Text style={styles.pageBtnText}>{t("newOrders.previous")}</Text>
          </TouchableOpacity>

          <Text style={styles.pageOfText}>
            {t("newOrders.pageOf", { page, lastPage })}
          </Text>

          <TouchableOpacity
            style={styles.pageBtn}
            disabled={page === lastPage}
            onPress={() => setPage(page + 1)}
          >
            <Text style={styles.pageBtnText}>{t("newOrders.next")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* was: a fixed inset-0 overlay <div> — RN Modal is the native way
          to do an overlay/popup */}
      <Modal
        visible={showAcceptPopup && !!selectedItem}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAcceptPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t("newOrders.enterPrice")}</Text>

            <TextInput
              style={styles.priceInput}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  isSaveDisabled() && styles.saveBtnDisabled,
                ]}
                onPress={handleAccept}
                disabled={isSaveDisabled() || saveLoading}
              >
                <Text style={styles.saveBtnText}>
                  {saveLoading ? t("newOrders.saving") : t("newOrders.save")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowAcceptPopup(false)}>
                <Text style={styles.cancelText}>{t("newOrders.cancel")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Footer />
    </View>
  );
};

export default NewOrders;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.gray50 },
  title: { fontSize: 26, fontWeight: "bold", color: "#0a3460" },
  subtitle: { color: colors.gray500, marginTop: 6 },
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
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.gray800,
    marginBottom: 10,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  addressText: { fontSize: 13, color: colors.gray500 },
  deliverToText: { fontSize: 13, color: colors.gray500, marginBottom: 12 },
  hr: { height: 1, backgroundColor: colors.gray200, marginBottom: 12 },
  acceptBtn: {
    backgroundColor: colors.darkBlue,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  acceptBtnText: { color: colors.white, fontWeight: "600" },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 20,
  },
  pageBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  pageBtnText: { color: colors.gray500, fontWeight: "500" },
  pageOfText: { fontWeight: "500", color: colors.gray700 },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.black40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: colors.white,
    width: 320,
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: { fontWeight: "600", marginBottom: 14, fontSize: 16 },
  priceInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 6,
    padding: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 16,
    alignItems: "center",
  },
  saveBtn: {
    backgroundColor: colors.cyan,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  saveBtnDisabled: { backgroundColor: colors.gray300 },
  saveBtnText: { color: colors.white, fontWeight: "600" },
  cancelText: { color: colors.gray700 },
});
