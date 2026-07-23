import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import PharmacistHeader from "../../Components/header/PharmacistHeader";
import Footer from "../../Components/footer/Footer";

export default function MyOrders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [deliveryPage, setDeliveryPage] = useState(1);
  const [deliveryTotalPages, setDeliveryTotalPages] = useState(1);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState(null);
  const [deliveryLoadBtn, setDeliveryLoadBtn] = useState(false);

  const [showMedsModal, setShowMedsModal] = useState(false);
  const [selectedOrderMeds, setSelectedOrderMeds] = useState([]);

  const [pastOrders, setPastOrders] = useState([]);
  const [pastPage, setPastPage] = useState(1);
  const [pastTotalPages, setPastTotalPages] = useState(1);
  const [pastLoading, setPastLoading] = useState(false);
  const [pastError, setPastError] = useState(null);
  const [pastLoadBtn, setPastLoadBtn] = useState(false);

  const fetchOrders = async (pageNumber = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/pharmacist/my-orders?page=${pageNumber}&per_page=3`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || t("myOrdersScreen.requestFailed"));
      }

      const data = await response.json();
      console.log("Request Accepted: ", data);
      setOrders(data.data || []);
      setPage(data.meta?.current_page || 1);
      setTotalPages(data.meta?.last_page || 1);
    } catch (err) {
      console.error("Failed fetching orders:", err);
      setError(err?.message || t("myOrdersScreen.loadOrdersFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeliveryOrders = async () => {
    if (!deliveryLoadBtn) return;
    setDeliveryLoading(true);
    setDeliveryError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/pharmacist/orders/track?page=${deliveryPage}&per_page=3`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || t("myOrdersScreen.requestFailed"));
      }

      const data = await response.json();
      console.log("accepted by delivery: ", data);
      setDeliveryOrders(data.data || []);
      setDeliveryPage(data.meta?.current_page || 1);
      setDeliveryTotalPages(data.meta?.last_page || 1);
    } catch (err) {
      setDeliveryError(err.message || t("myOrdersScreen.loadDeliveryFailed"));
    } finally {
      setDeliveryLoading(false);
    }
  };

  const fetchPastOrders = async () => {
    if (!pastLoadBtn) return;
    setPastLoading(true);
    setPastError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/pharmacist/orders/history?page=${pastPage}&per_page=3`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || t("myOrdersScreen.requestFailed"));
      }

      const data = await response.json();
      console.log("past orders:", data);
      setPastOrders(data.data || []);
      setPastPage(data.meta?.current_page || 1);
      setPastTotalPages(data.meta?.last_page || 1);
    } catch (err) {
      setPastError(err.message || t("myOrdersScreen.loadPastFailed"));
    } finally {
      setPastLoading(false);
    }
  };

  useEffect(() => {
    if (pastLoadBtn) fetchPastOrders();
  }, [pastLoadBtn, pastPage]);

  useEffect(() => {
    if (deliveryLoadBtn) fetchDeliveryOrders();
  }, [deliveryLoadBtn, deliveryPage]);

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const handleDeliverOrder = async (order_id) => {
    try {
      setLoadingId(order_id);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/pharmacist/orders/${order_id}/ready`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const result = await response.json();

      if (result.status === "success") {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === order_id
              ? { ...order, status: "ready_for_delivery" }
              : order
          )
        );
      }
    } catch (error) {
      console.error("Deliver error:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const PaginationBar = ({ pageNum, total, onPrev, onNext }) => (
    <View style={styles.paginationRow}>
      <TouchableOpacity
        disabled={pageNum === 1}
        onPress={onPrev}
        style={styles.pageBtn}
      >
        <Text
          style={[styles.pageBtnText, pageNum === 1 && styles.pageBtnTextDisabled]}
        >
          {t("myOrdersScreen.previous")}
        </Text>
      </TouchableOpacity>

      <Text style={styles.pageInfo}>
        {pageNum} of {total}
      </Text>

      <TouchableOpacity
        disabled={pageNum === total}
        onPress={onNext}
        style={styles.pageBtn}
      >
        <Text
          style={[
            styles.pageBtnText,
            pageNum === total && styles.pageBtnTextDisabled,
          ]}
        >
          {t("common.next")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <PharmacistHeader />
      <ScrollView style={{ backgroundColor: "#f9fafb" }} contentContainerStyle={{ paddingBottom: 30 }}>

        {/* Pharmacist Accepted Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("myOrdersScreen.yourReceipts")}</Text>
          <Text style={styles.sectionSubtitle}>
            {t("myOrdersScreen.readySubtitle")}
          </Text>

          {isLoading ? (
            <ActivityIndicator size="large" color="#39CCCC" style={{ marginVertical: 20 }} />
          ) : orders.length > 0 ? (
            <>
              <View style={styles.cardsWrap}>
                {orders.map((order) => (
                  <View key={order.id} style={styles.card}>
                    <Text style={styles.patientName}>{order.patient}</Text>
                    <Text style={styles.sourceText}>
                      <Text style={styles.labelCyan}>{t("myOrdersScreen.source")} </Text>
                      {order.source}
                    </Text>

                    <View style={{ marginTop: 10 }}>
                      {order.medicines?.length > 0 &&
                        order.medicines.map((med, index) => (
                          <View key={index} style={{ marginBottom: 8 }}>
                            <Text style={styles.medName}>
                              {med.name} - {med.dosage} :
                            </Text>
                            <View style={{ marginLeft: 12 }}>
                              <Text style={styles.medDetail}>
                                {t("myOrdersScreen.box")} {med.quantity || med.boxes}
                              </Text>
                              <Text style={styles.medDetail}>
                                {t("myOrdersScreen.pricePerBox")} {med.price_per_unit}
                              </Text>
                            </View>
                          </View>
                        ))}

                      {order.image_url && (
                        <TouchableOpacity
                          onPress={() => setSelectedImage(order.image_url)}
                        >
                          <Image
                            source={{ uri: order.image_url }}
                            style={styles.prescriptionThumb}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.totalText}>
                      {t("myOrdersScreen.totalItems", {
                        qty: order.total_quantity,
                        price: order.total_medicine_price,
                      })}
                    </Text>

                    <TouchableOpacity
                      onPress={() => handleDeliverOrder(order.id)}
                      disabled={order.status !== "accepted"}
                      style={[
                        styles.deliverBtn,
                        order.status === "ready_for_delivery"
                          ? styles.deliverBtnReady
                          : order.status !== "accepted"
                          ? styles.deliverBtnDisabled
                          : styles.deliverBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.deliverBtnText,
                          order.status === "ready_for_delivery" && {
                            color: "#0a3460",
                          },
                          order.status !== "accepted" &&
                            order.status !== "ready_for_delivery" && {
                              color: "#6b7280",
                            },
                        ]}
                      >
                        {loadingId === order.id
                          ? t("myOrdersScreen.processing")
                          : order.status === "ready_for_delivery"
                          ? t("myOrdersScreen.readyForDelivery")
                          : t("myOrdersScreen.markAsReady")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <PaginationBar
                pageNum={page}
                total={totalPages}
                onPrev={() => setPage((p) => p - 1)}
                onNext={() => setPage((p) => p + 1)}
              />
            </>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.emptyText}>{t("myOrdersScreen.noOrdersFound")}</Text>
          )}
        </View>

        {/* Orders Assigned to Delivery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("myOrdersScreen.assignedToDelivery")}</Text>
          <Text style={styles.sectionSubtitle}>
            {t("myOrdersScreen.trackSubtitle")}
          </Text>
          {!deliveryLoadBtn ? (
            <TouchableOpacity
              onPress={() => setDeliveryLoadBtn(true)}
              style={styles.loadBtn}
            >
              <Text style={styles.loadBtnText}>{t("myOrdersScreen.loadOrders")}</Text>
            </TouchableOpacity>
          ) : deliveryLoading ? (
            <ActivityIndicator size="large" color="#39CCCC" style={{ marginVertical: 20 }} />
          ) : deliveryOrders.length > 0 ? (
            <>
              <View style={styles.cardsWrap}>
                {deliveryOrders.map((order) => {
                  const delivery = order.delivery;
                  const agent = delivery?.delivery_agent;

                  return (
                    <View key={order.order_id} style={styles.card}>
                      <Text style={styles.patientName}>
                        {t("myOrdersScreen.orderNumber", { id: order.order_id })}
                      </Text>

                      <Text style={styles.sourceText}>
                        <Text style={styles.labelCyan}>{t("myOrdersScreen.status")} </Text>
                        {agent ? agent?.driver_status : order.message}
                      </Text>

                      <Text style={styles.sourceText}>
                        {delivery ? (
                          <>
                            <Text style={styles.labelCyan}>{t("myOrdersScreen.assignedAt")} </Text>
                            {new Date(delivery?.assigned_at)?.toLocaleString()}
                          </>
                        ) : (
                          <>
                            <Text style={styles.labelCyan}>{t("myOrdersScreen.createdAt")} </Text>
                            {new Date(order?.created_at)?.toLocaleString()}
                          </>
                        )}
                      </Text>

                      {order.medications && (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedOrderMeds(order.medications);
                            setShowMedsModal(true);
                          }}
                          style={styles.viewMedsBtn}
                        >
                          <Text style={styles.viewMedsBtnText}>
                            {t("myOrdersScreen.viewMedications")}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {agent && (
                        <View style={styles.agentBox}>
                          <Image
                            source={{ uri: agent.driver_image || undefined }}
                            defaultSource={require("../../../assets/no-photo.png")}
                            style={styles.agentAvatar}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.agentName}>{agent.name}</Text>
                            <Text style={styles.agentDetail}>
                              <Text style={styles.labelCyan}>{t("myOrdersScreen.vehicle")} </Text>
                              {agent.vehicle_type} • {agent.plate_number}
                            </Text>
                            <Text style={styles.agentDetail}>
                              <Text style={styles.labelCyan}>{t("myOrdersScreen.phone")} </Text>
                              {agent?.phone}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
              <PaginationBar
                pageNum={deliveryPage}
                total={deliveryTotalPages}
                onPrev={() => setDeliveryPage((p) => p - 1)}
                onNext={() => setDeliveryPage((p) => p + 1)}
              />
            </>
          ) : deliveryError ? (
            <Text style={styles.errorText}>{deliveryError}</Text>
          ) : (
            <Text style={styles.emptyText}>{t("myOrdersScreen.noDeliveryOrders")}</Text>
          )}
        </View>
        {/* Past Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("myOrdersScreen.pastOrders")}</Text>
          <Text style={styles.sectionSubtitle}>{t("myOrdersScreen.pastSubtitle")}</Text>

          {!pastLoadBtn ? (
            <TouchableOpacity
              onPress={() => setPastLoadBtn(true)}
              style={styles.loadBtn}
            >
              <Text style={styles.loadBtnText}>{t("myOrdersScreen.loadOrders")}</Text>
            </TouchableOpacity>
          ) : pastLoading ? (
            <ActivityIndicator size="large" color="#39CCCC" style={{ marginVertical: 20 }} />
          ) : pastOrders.length > 0 ? (
            <>
              <View style={styles.cardsWrap}>
                {pastOrders.map((order) => (
                  <View key={order.order_id} style={styles.card}>
                    <Text style={styles.patientName}>
                      {t("myOrdersScreen.orderNumber", { id: order.order_id })}
                    </Text>

                    <Text style={styles.deliveredAt}>
                      <Text style={styles.labelDarkBlueBig}>
                        {t("myOrdersScreen.deliveredAt")}{" "}
                      </Text>
                      {new Date(order.delivered_at).toLocaleString()}
                    </Text>

                    {order.patient ? (
                      <>
                        <Text style={styles.sectionSubHeading}>{t("myOrdersScreen.patient")}</Text>
                        <View style={{ marginLeft: 12 }}>
                          <Text style={styles.detailLine}>
                            <Text style={styles.labelCyan}>{t("myOrdersScreen.name")} </Text>
                            {order.patient.name}
                          </Text>
                          <Text style={styles.detailLine}>
                            <Text style={styles.labelCyan}>{t("myOrdersScreen.address")} </Text>
                            {order.patient.address}
                          </Text>
                          <Text style={styles.detailLine}>
                            <Text style={styles.labelCyan}>{t("myOrdersScreen.phone")} </Text>
                            {order.patient.phone}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <Text style={styles.detailLine}>{t("myOrdersScreen.unknownPatient")}</Text>
                    )}

                    <Text style={styles.sectionSubHeading}>{t("myOrdersScreen.medicationsLabel")}</Text>
                    {order.medications?.length > 0 ? (
                      order.medications.map((med, index) => (
                        <View key={index} style={{ marginLeft: 12, marginTop: 4 }}>
                          <Text style={styles.medName}>
                            {med.medication_name} :
                          </Text>
                          <View style={{ marginLeft: 12 }}>
                            <Text style={styles.medDetail}>
                              {t("myOrdersScreen.box")} {med.quantity}
                            </Text>
                            <Text style={styles.medDetail}>
                              {t("myOrdersScreen.pricePerBox")} {med.price}
                            </Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.detailLine}>{t("myOrdersScreen.unknownMedications")}</Text>
                    )}
                    <Text style={styles.totalTextBig}>
                      {t("myOrdersScreen.total", { amount: order.total_medicine_price })}
                    </Text>

                    <Text style={styles.sectionSubHeading}>{t("myOrdersScreen.deliveredBy")}</Text>
                    {order.delivery ? (
                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.detailLine}>
                          <Text style={styles.labelCyan}>{t("myOrdersScreen.name")} </Text>
                          {order.delivery.name}
                        </Text>
                        <Text style={styles.detailLine}>
                          <Text style={styles.labelCyan}>{t("myOrdersScreen.phone")} </Text>
                          {order.delivery.phone}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.detailLine}>{t("myOrdersScreen.unknownDeliveryAgent")}</Text>
                    )}
                  </View>
                ))}
              </View>
              <PaginationBar
                pageNum={pastPage}
                total={pastTotalPages}
                onPrev={() => setPastPage((p) => p - 1)}
                onNext={() => setPastPage((p) => p + 1)}
              />
            </>
          ) : pastError ? (
            <Text style={styles.errorText}>{pastError}</Text>
          ) : (
            <Text style={styles.emptyText}>{t("myOrdersScreen.noPastOrders")}</Text>
          )}
        </View>

        <Footer />
      </ScrollView>

      {/* Medications Modal */}
      <Modal
        visible={showMedsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMedsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t("myOrdersScreen.medicationsModalTitle")}</Text>

            {selectedOrderMeds.length > 0 ? (
              <View style={{ gap: 10 }}>
                {selectedOrderMeds.map((med, index) => (
                  <View key={index} style={styles.medRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.medRowName}>
                        {med.name} - {med.dosage}
                      </Text>
                      <Text style={styles.medRowQty}>
                        {t("myOrdersScreen.quantity")} {med.quantity}
                      </Text>
                    </View>
                    <Text style={styles.medRowPrice}>${med.price}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>{t("myOrdersScreen.noMedicationsFound")}</Text>
            )}

            <TouchableOpacity
              onPress={() => setShowMedsModal(false)}
              style={styles.closeModalBtn}
            >
              <Text style={styles.closeModalBtnText}>{t("myOrdersScreen.close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <TouchableOpacity
          style={styles.imageOverlay}
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}
        >
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0a3460",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
    marginVertical: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#4b5563",
    marginVertical: 16,
  },
  loadBtn: {
    alignSelf: "center",
    backgroundColor: "#052443",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 16,
  },
  loadBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cardsWrap: {
    gap: 16,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  patientName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  sourceText: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 6,
  },
  labelCyan: {
    color: "#39CCCC",
    fontWeight: "700",
  },
  medName: {
    fontWeight: "700",
    color: "#374151",
    fontSize: 13,
  },
  medDetail: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 12,
  },
  prescriptionThumb: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 8,
  },
  totalText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#052443",
  },
  deliverBtn: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  deliverBtnActive: {
    backgroundColor: "#052443",
  },
  deliverBtnReady: {
    backgroundColor: "rgba(57,204,204,0.2)",
  },
  deliverBtnDisabled: {
    backgroundColor: "#d1d5db",
  },
  deliverBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginBottom: 10,
  },
  pageBtn: {
    borderWidth: 1,
    borderColor: "#39CCCC",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pageBtnText: {
    color: "#39CCCC",
    fontWeight: "600",
  },
  pageBtnTextDisabled: {
    color: "#9ca3af",
  },
  pageInfo: {
    color: "#374151",
    fontWeight: "600",
  },
  viewMedsBtn: {
    backgroundColor: "#052443",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 14,
  },
  viewMedsBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  agentBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  agentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#39CCCC",
  },
  agentName: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1f2937",
  },
  agentDetail: {
    fontSize: 13,
    color: "#374151",
    marginTop: 2,
  },
  deliveredAt: {
    fontSize: 16,
    marginTop: 10,
  },
  labelDarkBlueBig: {
    fontSize: 18,
    color: "#052443",
    fontWeight: "700",
  },
  sectionSubHeading: {
    marginTop: 10,
    fontWeight: "700",
    color: "#052443",
    fontSize: 16,
  },
  detailLine: {
    fontSize: 13,
    color: "#374151",
    marginTop: 2,
  },
  totalTextBig: {
    marginTop: 10,
    fontWeight: "700",
    color: "#052443",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0a3460",
    marginBottom: 16,
  },
  medRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 8,
  },
  medRowName: {
    fontWeight: "600",
    color: "#1f2937",
  },
  medRowQty: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 2,
  },
  medRowPrice: {
    fontWeight: "700",
    color: "#0a3460",
  },
  closeModalBtn: {
    marginTop: 20,
    backgroundColor: "#0a3460",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  closeModalBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "80%",
  },
});