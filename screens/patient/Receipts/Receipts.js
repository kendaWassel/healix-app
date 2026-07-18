// screens/patient/Receipts/Receipts.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal as RNModal,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import PatientHeader from "../../Components/header/PatientHeader";
import Footer from "../../Components/footer/Footer";
import SendToPharmacy from "./SendtoPharmacy";
import ReceiptDetails from "./ReceiptsDetails";
import YouAreDone from "./YouAreDone";
import Modal from "./Modal";
import PaymentModal from "../../Components/servicesCard/PayementModal";
import RatingModal from "../DoctorConsultation/booking/RatingModal";
import DoneModal from "../DoctorConsultation/booking/DoneModal";

const DDI_URL = "https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/ddi";

export default function Receipts() {
  const navigation = useNavigation();

  const [receipts, setReceipts] = useState([]);
  const [pharmacistReceipts, setPharmacistReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPharmacist, setIsLoadingPharmacist] = useState(false);
  const [error, setError] = useState(null);
  const [errorPharmacist, setErrorPharmacist] = useState(null);

  const [sendPharmacy, setSendPharmacy] = useState(false);
  const [done, setDone] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showBookingDone, setShowBookingDone] = useState(false);
  const [ratingStep, setRatingStep] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  const [selectedPharmacistId, setSelectedPharmacistId] = useState(null);

  const [showDrugChecker, setShowDrugChecker] = useState(false);
  const [drugA, setDrugA] = useState("");
  const [drugB, setDrugB] = useState("");
  const [checkResult, setCheckResult] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkError, setCheckError] = useState("");

  const [uploadDisabled, setUploadDisabled] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [sendPharmacyReceiptId, setSendPharmacyReceiptId] = useState(null);
  const [phLoadBtn, setPhLoadBtn] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryData, setDeliveryData] = useState(null);
  const [deliveryMessage, setDeliveryMessage] = useState("");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 3,
    totalPages: 1,
  });
  const [pharmacistPagination, setPharmacistPagination] = useState({
    currentPage: 1,
    itemsPerPage: 3,
    totalPages: 1,
  });

  const fetchMyReceipts = async () => {
    setIsLoading(true);
    setError(null);
    const token = await AsyncStorage.getItem("token");

    try {
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patient/prescriptions?page=${pagination.currentPage}&per_page=${pagination.itemsPerPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("my receipts: ", data);
      if (data?.status === "success" && Array.isArray(data?.data?.items)) {
        const formatted = data.data.items.map((p) => ({
          id: p.id,
          Name: p.doctor_name || "Uploaded by you",
          Date: p.issued_at ? new Date(p.issued_at).toLocaleDateString() : "",
          status: p.status || "N/A",
          diagnosis: p.diagnosis || "N/A",
          prescription_image_url: p.prescription_image_url || null,
        }));

        setReceipts(formatted);

        setPagination((prev) => ({
          ...prev,
          totalPages: Math.ceil(
            (data.data.meta?.total || 0) / (data.data.meta?.per_page || 1)
          ),
        }));
      } else {
        setReceipts([]);
        setPagination((prev) => ({ ...prev, totalPages: 1 }));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load receipts.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPharmacistReceipts = async () => {
    if (!phLoadBtn) return;
    setIsLoadingPharmacist(true);
    setErrorPharmacist(null);
    const token = await AsyncStorage.getItem("token");

    try {
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patient/view-prescriptions-with-pricing?page=${pharmacistPagination.currentPage}&per_page=${pharmacistPagination.itemsPerPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("pharmacist receipts: ", data);

      const receiptData = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      const meta = data?.meta || data.meta;

      if (Array.isArray(receiptData)) {
        const formatted = receiptData.map((p) => ({
          id: p.order_id,
          task_id: p.task_id,
          delivery_id: p.delivery_id,
          items: p.items || [],
          name: p.pharmacy?.name || "Unknown Pharmacy",
          pharmacy: p.pharmacy,
          prescription_id: p.prescription_id,
          date: p.priced_at ? new Date(p.priced_at).toLocaleDateString() : "",
          source: p.source || "Unknown",
          order_status: p.order_status || "Unknown",
          prescription_status: p.prescription_status || "Unknown",
          total_amount: p.total_amount || 0,
          total_price: p.total_price || 0,
          total_quantity: p.total_quantity || 0,
        }));

        setPharmacistReceipts(formatted);

        setPharmacistPagination((prev) => ({
          ...prev,
          totalPages: Math.ceil(
            (meta?.total_pages || 0) / (meta?.per_page || 1)
          ),
        }));
      } else {
        setPharmacistReceipts([]);
        setPharmacistPagination((prev) => ({ ...prev, totalPages: 1 }));
      }
    } catch (err) {
      console.error(err);
      setErrorPharmacist("Failed to load pharmacist receipts.");
    } finally {
      setIsLoadingPharmacist(false);
    }
  };

  const fetchDeliveryInfo = async (order_id) => {
    setDeliveryLoading(true);
    setDeliveryData(null);
    setDeliveryMessage("");

    const token = await AsyncStorage.getItem("token");

    try {
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patient/orders/${order_id}/delivery-info`,
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("delivery info:", data);

      if (data.status === "success") {
        setDeliveryData(data.data);
        if (!data.data?.delivery) {
          setDeliveryMessage(
            data.data?.message || "No delivery agent assigned yet"
          );
        }
      } else {
        setDeliveryMessage(data.message || "No delivery assigned yet");
      }
    } catch (err) {
      console.error(err);
      setDeliveryMessage("Failed to load delivery info");
    } finally {
      setDeliveryLoading(false);
    }
  };

  useEffect(() => {
    setShowPaymentModal(false);
    fetchMyReceipts();
  }, [pagination.currentPage]);

  useEffect(() => {
    setShowPaymentModal(false);
    if (phLoadBtn) fetchPharmacistReceipts();
  }, [phLoadBtn, pharmacistPagination.currentPage]);

  const handlePayAndRate = (item) => {
    setSelectedOrderId(item.id);
    setSelectedTaskId(item.task_id);
    setSelectedPharmacistId(item.pharmacy?.id);
    setSelectedDeliveryId(item.delivery_id);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setRatingStep("delivery");
    setTimeout(() => setShowRatingModal(true), 300);
  };

  const handleDeliveryRatingSuccess = () => {
    setShowRatingModal(false);
    setRatingStep("pharmacist");
    setTimeout(() => setShowRatingModal(true), 300);
  };

  const handlePharmacistRatingSuccess = () => {
    setShowRatingModal(false);
    setRatingStep(null);
    setTimeout(() => setShowBookingDone(true), 300);
  };

  const handleRatingSkip = () => {
    setShowRatingModal(false);
    if (ratingStep === "delivery") {
      setRatingStep("pharmacist");
      setTimeout(() => setShowRatingModal(true), 300);
    } else if (ratingStep === "pharmacist") {
      setRatingStep(null);
      setTimeout(() => setShowBookingDone(true), 300);
    }
  };

  const handleUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Permission to access photos is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    await uploadReceiptImage(result.assets[0]);
  };

  const uploadReceiptImage = async (asset) => {
    setUploadDisabled(true);
    const token = await AsyncStorage.getItem("token");

    const formData = new FormData();
    formData.append("image", {
      uri: asset.uri,
      name: asset.fileName || "receipt.jpg",
      type: asset.mimeType || "image/jpeg",
    });
    formData.append("category", "prescription");

    try {
      setIsLoading(true);

      const response = await fetch(
        "https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patient/prescriptions/upload",
        {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        fetchMyReceipts();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to upload receipt.");
    } finally {
      setIsLoading(false);
      setUploadDisabled(false);
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };
  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };
  const handlePharmacistNextPage = () => {
    if (pharmacistPagination.currentPage < pharmacistPagination.totalPages) {
      setPharmacistPagination((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
    }
  };
  const handlePharmacistPrevPage = () => {
    if (pharmacistPagination.currentPage > 1) {
      setPharmacistPagination((prev) => ({
        ...prev,
        currentPage: prev.currentPage - 1,
      }));
    }
  };

  const handleCheckInteraction = async () => {
    if (!drugA.trim() || !drugB.trim()) {
      setCheckError("Please enter both drug names");
      return;
    }
    setCheckLoading(true);
    setCheckError("");
    setCheckResult(null);

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${DDI_URL}/interaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ drug_a: drugA, drug_b: drugB }),
      });
      const result = await res.json();

      if (!res.ok) {
        setCheckError(result.message || result.detail || "Drug not found");
        return;
      }
      setCheckResult(result.data || result);
    } catch (err) {
      setCheckError("Connection failed. Try again.");
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <PatientHeader />
      <ScrollView style={{ backgroundColor: "#fff" }} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* My Receipts */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>My Receipts</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={handleUpload}
                disabled={uploadDisabled}
                style={[styles.addBtn, uploadDisabled && styles.btnDisabled]}
              >
                <Text style={styles.addBtnText}>Upload Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowDrugChecker(true);
                  setDrugA("");
                  setDrugB("");
                  setCheckResult(null);
                  setCheckError("");
                }}
                style={styles.addBtn}
              >
                <Text style={styles.addBtnText}>Check Interaction</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>
            Check Your Receipts and send them or add new ones
          </Text>

          {isLoading ? (
            <ActivityIndicator size="large" color="#39CCCC" style={{ marginVertical: 20 }} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : receipts.length > 0 ? (
            <>
              <View style={styles.cardsWrap}>
                {receipts.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setSelectedReceiptId(item.id)}
                    style={styles.receiptCard}
                  >
                    <View style={styles.receiptCardTop}>
                      <Text style={styles.receiptName}>{item.Name}</Text>
                      <Text style={styles.receiptDate}>{item.Date}</Text>
                      {item.status === "rejected" && (
                        <View style={styles.rejectedBadge}>
                          <Text style={styles.rejectedBadgeText}>
                            {item.status}
                          </Text>
                        </View>
                      )}
                    </View>
                    {item.status === "created" || item.status === "rejected" ? (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation?.();
                          setSendPharmacyReceiptId(item.id);
                          setSendPharmacy(true);
                        }}
                        style={styles.sendBtn}
                      >
                        <Ionicons name="send" size={14} color="#fff" />
                        <Text style={styles.sendBtnText}>Send to Pharmacy</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.sentBadge}>
                        <Text style={styles.sentBadgeText}>Sent</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  onPress={handlePrevPage}
                  disabled={pagination.currentPage === 1}
                  style={styles.pageBtn}
                >
                  <Text style={styles.pageBtnText}>Prev</Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>
                  {pagination.currentPage} of {pagination.totalPages}
                </Text>
                <TouchableOpacity
                  onPress={handleNextPage}
                  disabled={pagination.currentPage === pagination.totalPages}
                  style={styles.pageBtn}
                >
                  <Text style={styles.pageBtnText}>Next</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>No Delivery Orders Found</Text>
          )}

          <SendToPharmacy
            open={sendPharmacy}
            prescription_id={sendPharmacyReceiptId}
            onClose={() => setSendPharmacy(false)}
            onDone={() => {
              setSendPharmacy(false);
              setDone(true);
            }}
          />

          <YouAreDone
            isOpen={done}
            onHome={() => {
              setDone(false);
              navigation.navigate("PatientHome");
            }}
          />

          {selectedReceiptId && (
            <ReceiptDetails
              open
              prescription_id={selectedReceiptId}
              onClose={() => setSelectedReceiptId(null)}
            />
          )}
        </View>

        {/* Pharmacist Receipts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receipts from pharmacist</Text>
          <Text style={styles.sectionSubtitle}>
            Check Your accepted receipts
          </Text>

          {!phLoadBtn ? (
            <TouchableOpacity
              onPress={() => setPhLoadBtn(true)}
              style={styles.loadBtn}
            >
              <Text style={styles.loadBtnText}>Load Orders</Text>
            </TouchableOpacity>
          ) : isLoadingPharmacist ? (
            <ActivityIndicator size="large" color="#39CCCC" style={{ marginVertical: 20 }} />
          ) : errorPharmacist ? (
            <Text style={styles.errorText}>{errorPharmacist}</Text>
          ) : pharmacistReceipts.length > 0 ? (
            <>
              <View style={styles.cardsWrap}>
                {pharmacistReceipts.map((item) => (
                  <View key={item.id} style={styles.receiptCard}>
                    <Text style={styles.receiptName}>{item.name}</Text>
                    <Text style={styles.detailLine}>
                      <Text style={styles.detailLabel}>Source: </Text>
                      {item.source}
                    </Text>
                    <Text style={styles.detailLine}>
                      <Text style={styles.detailLabel}>Status: </Text>
                      {item.order_status}
                    </Text>

                    {item.items && item.items.length > 0 && (
                      <View style={styles.medicinesBox}>
                        <Text style={styles.medicinesTitle}>Medicines:</Text>
                        {item.items.map((medicine, index) => (
                          <View key={index} style={styles.medicineRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.medicineName}>
                                {medicine.medicine_name}
                              </Text>
                              <Text style={styles.medicineQty}>
                                Quantity: {medicine.quantity}
                              </Text>
                            </View>
                            <Text style={styles.medicinePrice}>
                              ${medicine.price?.toFixed(2) || "0.00"}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={styles.totalRow}>
                      <Text style={styles.totalText}>
                        Total: ${item.total_price.toFixed(2)}
                      </Text>
                      <Text style={styles.totalText}>{item.date}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        setShowDeliveryModal(true);
                        fetchDeliveryInfo(item.id);
                      }}
                      style={styles.deliveryInfoBtn}
                    >
                      <Text style={styles.deliveryInfoBtnText}>
                        Delivery info
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.totalWithFee}>
                      Total Price with delivery fee: $
                      {item.total_amount.toFixed(2)}
                    </Text>

                    {item.order_status === "delivered" && (
                      <TouchableOpacity
                        onPress={() => handlePayAndRate(item)}
                        style={styles.payRateBtn}
                      >
                        <Text style={styles.payRateBtnText}>
                          Pay and Rate
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  onPress={handlePharmacistPrevPage}
                  disabled={pharmacistPagination.currentPage === 1}
                  style={styles.pageBtn}
                >
                  <Text style={styles.pageBtnText}>Prev</Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>
                  {pharmacistPagination.currentPage} of{" "}
                  {pharmacistPagination.totalPages}
                </Text>
                <TouchableOpacity
                  onPress={handlePharmacistNextPage}
                  disabled={
                    pharmacistPagination.currentPage ===
                    pharmacistPagination.totalPages
                  }
                  style={styles.pageBtn}
                >
                  <Text style={styles.pageBtnText}>Next</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>No Accepted Receipts Found</Text>
          )}
        </View>

        <Footer />
      </ScrollView>

      {/* Delivery Info Modal */}
      <Modal open={showDeliveryModal} onClose={() => setShowDeliveryModal(false)}>
        <Text style={styles.modalTitle}>Delivery Information</Text>

        {deliveryLoading ? (
          <ActivityIndicator size="large" color="#39CCCC" />
        ) : deliveryData?.delivery ? (
          <View style={styles.deliveryInfoRow}>
            <Image
              source={{ uri: deliveryData.delivery?.image || undefined }}
              defaultSource={require("../../../assets/no-photo.png")}
              style={styles.deliveryAvatar}
            />
            <View style={{ gap: 4 }}>
              <Text style={styles.deliveryName}>
                {deliveryData.delivery?.name}
              </Text>
              <Text style={styles.deliveryDetail}>
                <Text style={styles.deliveryLabel}>Phone: </Text>
                {deliveryData.delivery?.phone}
              </Text>
              <Text style={styles.deliveryDetail}>
                <Text style={styles.deliveryLabel}>Vehicle: </Text>
                {deliveryData.delivery?.vehicle_type}
              </Text>
              <Text style={styles.deliveryDetail}>
                <Text style={styles.deliveryLabel}>Plate Number: </Text>
                {deliveryData.delivery?.plate_number}
              </Text>
              <Text style={styles.deliveryDetail}>
                <Text style={styles.deliveryLabel}>Status: </Text>
                {deliveryData.order_status}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>
            {deliveryMessage || "No delivery information available"}
          </Text>
        )}
      </Modal>

      <RatingModal
        isOpen={showRatingModal}
        onClose={handleRatingSkip}
        url={
          ratingStep === "delivery"
            ? `task/${selectedTaskId}/rate/${selectedDeliveryId}`
            : ratingStep === "pharmacist"
            ? `order/${selectedOrderId}/rate/${selectedPharmacistId}`
            : ""
        }
        onRatingSuccess={
          ratingStep === "delivery"
            ? handleDeliveryRatingSuccess
            : ratingStep === "pharmacist"
            ? handlePharmacistRatingSuccess
            : () => {}
        }
        message={
          ratingStep === "delivery"
            ? "Rate Delivery service"
            : ratingStep === "pharmacist"
            ? "Rate Pharmacist service"
            : ""
        }
      />
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        paymentType="delivery"
      />
      <DoneModal
        isOpen={showBookingDone}
        onHome={() => {
          setShowBookingDone(false);
          fetchPharmacistReceipts();
        }}
        message="Thank you for your feedback!"
      />

      {/* Drug Interaction Checker */}
      <RNModal
        visible={showDrugChecker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDrugChecker(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.checkerCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.checkerTitle}>Check Drug Interaction</Text>

              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>First Drug</Text>
                <TextInput
                  value={drugA}
                  onChangeText={setDrugA}
                  placeholder="e.g. Warfarin"
                  style={styles.input}
                />
              </View>
              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>Second Drug</Text>
                <TextInput
                  value={drugB}
                  onChangeText={setDrugB}
                  placeholder="e.g. Aspirin"
                  style={styles.input}
                />
              </View>

              <TouchableOpacity
                onPress={handleCheckInteraction}
                disabled={checkLoading}
                style={[styles.checkBtn, checkLoading && styles.btnDisabled]}
              >
                <Text style={styles.checkBtnText}>
                  {checkLoading ? "Checking..." : "Check"}
                </Text>
              </TouchableOpacity>

              {checkError ? (
                <Text style={styles.checkErrorText}>{checkError}</Text>
              ) : null}

              {checkResult && (
                <View style={{ marginBottom: 12 }}>
                  {checkResult.prediction === "Interaction likely" ? (
                    <View
                      style={[
                        styles.resultBox,
                        checkResult.severity === "Major"
                          ? styles.resultMajor
                          : checkResult.severity === "Moderate"
                          ? styles.resultModerate
                          : styles.resultMinor,
                      ]}
                    >
                      <Text style={styles.resultTitle}>
                        ⚠️ Interaction Detected
                      </Text>
                      <Text style={styles.resultSeverity}>
                        {checkResult.severity === "Major"
                          ? "🔴 Major"
                          : checkResult.severity === "Moderate"
                          ? "🟠 Moderate"
                          : "🟡 Minor"}
                      </Text>
                      {checkResult.severity_confidence === "UNCERTAIN" && (
                        <Text style={styles.uncertainText}>
                          Model estimate only — verify clinically.
                        </Text>
                      )}
                      <Text style={styles.resultDrugs}>
                        {checkResult.drug_a} + {checkResult.drug_b}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.resultBox, styles.resultSafe]}>
                      <Text style={styles.resultSafeTitle}>
                        ✅ No Interaction Expected
                      </Text>
                      <Text style={styles.resultDrugs}>
                        {checkResult.drug_a} + {checkResult.drug_b}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.disclaimerText}>
                    This is for information only. Always consult your doctor
                    or pharmacist.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => setShowDrugChecker(false)}
                style={styles.closeCheckerBtn}
              >
                <Text style={styles.closeCheckerBtnText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </RNModal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0a3460",
  },
  sectionSubtitle: {
    color: "#6b7280",
    marginTop: 8,
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  addBtn: {
    backgroundColor: "#052443",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginVertical: 16,
  },
  cardsWrap: {
    gap: 14,
  },
  receiptCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  receiptCardTop: {
    marginBottom: 10,
  },
  receiptName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  receiptDate: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  rejectedBadge: {
    backgroundColor: "#f87171",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  rejectedBadgeText: {
    color: "#fff",
    fontSize: 12,
  },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#052443",
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
  },
  sendBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  sentBadge: {
    backgroundColor: "#e5e7eb",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  sentBadgeText: {
    color: "#374151",
    fontWeight: "600",
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginVertical: 16,
  },
  pageBtn: {
    borderWidth: 1,
    borderColor: "#39CCCC",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pageBtnText: {
    color: "#39CCCC",
    fontWeight: "600",
  },
  pageInfo: {
    color: "#374151",
    fontWeight: "500",
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
  detailLine: {
    fontSize: 14,
    color: "#374151",
    marginTop: 4,
  },
  detailLabel: {
    color: "#39CCCC",
    fontWeight: "700",
  },
  medicinesBox: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 10,
    marginTop: 8,
  },
  medicinesTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  medicineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  medicineName: {
    fontWeight: "500",
    fontSize: 13,
  },
  medicineQty: {
    color: "#6b7280",
    fontSize: 12,
  },
  medicinePrice: {
    fontWeight: "500",
    color: "#374151",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  totalText: {
    fontSize: 13,
    color: "#4b5563",
    fontWeight: "600",
  },
  deliveryInfoBtn: {
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 12,
  },
  deliveryInfoBtnText: {
    color: "#052443",
    fontWeight: "600",
  },
  totalWithFee: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "600",
    marginTop: 8,
  },
  payRateBtn: {
    backgroundColor: "#052443",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 12,
  },
  payRateBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0a3460",
    marginBottom: 16,
  },
  deliveryInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  deliveryAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#39CCCC",
  },
  deliveryName: {
    fontSize: 16,
    fontWeight: "700",
  },
  deliveryDetail: {
    fontSize: 13,
    color: "#374151",
  },
  deliveryLabel: {
    color: "#39CCCC",
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkerCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    width: "90%",
    maxWidth: 420,
    maxHeight: "85%",
  },
  checkerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0a3460",
    textAlign: "center",
    marginBottom: 16,
  },
  fieldWrapper: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  checkBtn: {
    backgroundColor: "#052443",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  checkBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  checkErrorText: {
    color: "#dc2626",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 10,
  },
  resultBox: {
    borderRadius: 10,
    borderWidth: 2,
    padding: 16,
  },
  resultMajor: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  resultModerate: { borderColor: "#eab308", backgroundColor: "#fefce8" },
  resultMinor: { borderColor: "#fde68a", backgroundColor: "#fefce8" },
  resultSafe: { borderColor: "#22c55e", backgroundColor: "#f0fdf4" },
  resultTitle: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  resultSeverity: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  uncertainText: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 6,
  },
  resultDrugs: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
  },
  resultSafeTitle: {
    fontWeight: "700",
    color: "#15803d",
    textAlign: "center",
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 10,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 8,
  },
  closeCheckerBtn: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  closeCheckerBtnText: {
    color: "#374151",
    fontWeight: "600",
  },
});