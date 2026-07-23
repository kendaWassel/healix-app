import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import PharmacistHeader from "../../Components/header/PharmacistHeader";
import Footer from "../../Components/footer/Footer";
import { useDrugSuggestion } from "../../Components/drugSuggestion/DrugSuggestion";

export default function NewOrders() {
  const { t } = useTranslation();
  const [prescriptions, setPrescriptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [showAcceptPopup, setShowAcceptPopup] = useState(false);
  const [showRejectPopup, setShowRejectPopup] = useState(false);

  const [RejectReason, setRejectReason] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [prices, setPrices] = useState({});
  const [dosages, setDosages] = useState([]);

  const [manualDrugNames, setManualDrugNames] = useState([""]);
  const [manualSafetyChecked, setManualSafetyChecked] = useState(false);

  const [safetyWarnings, setSafetyWarnings] = useState(null);
  const [showSafetyPopup, setShowSafetyPopup] = useState(false);
  const [safetyChecking, setSafetyChecking] = useState(false);
  const [safetyCheckStage, setSafetyCheckStage] = useState(null);
  const { suggestion, checkDrugName, clearSuggestion } = useDrugSuggestion();

  const fetchPrescriptions = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/pharmacist/prescriptions?page=${pageNumber}&per_page=3`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) throw new Error(t("newOrdersScreen.requestFailed"));

      const data = await response.json();
      console.log("prescriptions: ", data);
      setPrescriptions(data.data);
      setPage(data.meta.current_page);
      setTotalPages(data.meta.last_page);
    } catch (err) {
      setError(t("newOrdersScreen.loadPrescriptionsFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions(page);
  }, [page]);

  const runSafetyCheck = async (prescriptionId, manualDrugs = null) => {
    const result = { interactions: [], pregnancy: [], allergies: [], hasWarning: false };

    try {
      const token = await AsyncStorage.getItem("token");

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      };
      if (manualDrugs && manualDrugs.length > 0) {
        const uniqueDrugNames = [...new Set(manualDrugs.map((d) => d.toLowerCase()))]
          .map((lower) => manualDrugs.find((d) => d.toLowerCase() === lower));
        options.body = JSON.stringify({ medications: uniqueDrugNames });
      }

      const res = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/pharmacist/prescriptions/${prescriptionId}/verify`,
        options
      );

      if (res.ok) {
        const result_json = await res.json();
        console.log("Verify result:", result_json);
        const data = result_json.data || result_json;

        result.interactions = (data.drug_interactions || []).filter(
          (f) =>
            f.severity === "Major" ||
            f.severity === "Moderate" ||
            f.severity_confidence === "UNCERTAIN"
        );
        result.pregnancy = data.pregnancy_warnings || [];
        result.allergies = data.allergy_warnings || [];
        result.hasWarning = data.safe === false;
      } else {
        console.log("Verify failed:", res.status);
      }

      return result;
    } catch (err) {
      console.error("Safety check failed:", err);
      return result;
    }
  };

  const handleCheckManualDrugs = async () => {
    const validNames = manualDrugNames.filter((n) => n.trim() !== "");
    if (validNames.length === 0) return;

    setSafetyChecking(true);
    const safety = await runSafetyCheck(selectedItem.prescription_id, validNames);
    setSafetyChecking(false);

    if (safety.hasWarning) {
      setSafetyWarnings(safety);
      setSafetyCheckStage("manualBeforePricing");
      setShowAcceptPopup(false);
      setShowSafetyPopup(true);
    } else {
      proceedToManualPricing(validNames);
    }
  };

  const proceedToManualPricing = (names) => {
    setDosages(names.map((name) => ({ dosageName: name, dosage: "", price: "" })));
    setManualSafetyChecked(true);
  };

  const acceptManualSuggestion = (index) => {
    const updated = [...manualDrugNames];
    updated[index] = suggestion.value;
    setManualDrugNames(updated);
    clearSuggestion();
  };

  const handleAccept = async (prescription_id) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/pharmacist/prescriptions/${prescription_id}/accept`,
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
      if (!response.ok) throw new Error(result.message);

      if (result.data?.status === "accepted") {
        await sendPrice(prescription_id);
      }
      console.log("Accepted response : ", result);
      setPrescriptions((prev) =>
        prev.filter((p) => p.prescription_id !== prescription_id)
      );
      setPrices({});
      setDosages([]);
      setShowAcceptPopup(false);
      setManualSafetyChecked(false);
      setManualDrugNames([""]);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const sendPrice = async (order_id) => {
    const token = await AsyncStorage.getItem("token");
    const items = dosages.map((d) => ({
      medicine_name: d.dosageName,
      dosage: d.dosage,
      price: Number(d.price),
    }));

    const response = await fetch(
      `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/pharmacist/prescriptions/${order_id}/add-price`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ items }),
      }
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || t("newOrdersScreen.addPriceFailed"));
    }
    Alert.alert("Success", t("newOrdersScreen.pricesAddedSuccess"));
  };

  const handleReject = async (prescription_id) => {
    if (!RejectReason) {
      Alert.alert("Error", t("newOrdersScreen.enterRejectionReason"));
      return;
    }
    setRejectLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/pharmacist/prescriptions/${prescription_id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ reason: RejectReason }),
        }
      );
      const result = await response.json();
      console.log("reject response: ", result);
      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || t("newOrdersScreen.rejectFailed"));
      }
      const rejectedId = result.data.prescription_id;
      setPrescriptions((prev) =>
        prev.filter((p) => p.prescription_id !== rejectedId)
      );
      setRejectReason("");
      setShowRejectPopup(false);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setRejectLoading(false);
      setShowRejectPopup(false);
      fetchPrescriptions();
    }
  };

  const isSaveDisabled = () => {
    if (selectedItem?.medicines && selectedItem.medicines.length > 0) {
      if (Object.keys(prices).length !== selectedItem.medicines.length) return true;
      return Object.values(prices).some((price) => !price || Number(price) <= 0);
    }
    if (dosages.length === 0) return true;
    return dosages.some(
      (d) => !d.dosageName.trim() || !d.dosage.trim() || !d.price || Number(d.price) <= 0
    );
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <View style={{ flex: 1 }}>
      <PharmacistHeader />

      <ScrollView style={{ backgroundColor: "#f9fafb" }} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("newOrdersScreen.title")}</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#39CCCC" style={{ marginVertical: 20 }} />
          ) : prescriptions.length > 0 ? (
            <View style={styles.cardsWrap}>
              {prescriptions.map((item) => (
                <View key={item.prescription_id} style={styles.card}>
                  <Text style={styles.patientName}>{item.patient}</Text>
                  <Text style={styles.sourceText}>{t("newOrdersScreen.source")} {item.source}</Text>
                  {item.medicines && item.medicines.length > 0 ? (
                    <View style={{ marginTop: 8 }}>
                      {item.medicines.map((m, i) => (
                        <Text key={i} style={styles.medLine}>
                          {m.name} - {m.dosage} x {m.boxes} - {m.instructions}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setSelectedImage(item.image_url)}>
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.prescriptionThumb}
                      />
                    </TouchableOpacity>
                  )}

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      onPress={async () => {
                        setSelectedItem(item);
                        setPrices({});
                        setDosages([]);
                        setManualDrugNames([""]);
                        setManualSafetyChecked(false);

                        if (!item.medicines || item.medicines.length === 0) {
                          setShowAcceptPopup(true);
                          return;
                        }

                        setSafetyChecking(true);
                        const safety = await runSafetyCheck(item.prescription_id);
                        setSafetyChecking(false);

                        if (safety.hasWarning) {
                          setSafetyWarnings(safety);
                          setSafetyCheckStage("initial");
                          setShowSafetyPopup(true);
                        } else {
                          setShowAcceptPopup(true);
                        }
                      }}
                    >
                      <Text style={styles.acceptText}>{t("newOrdersScreen.accept")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedItem(item);
                        setShowRejectPopup(true);
                        setRejectReason("");
                      }}
                    >
                      <Text style={styles.rejectText}>{t("newOrdersScreen.reject")}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={16} color="#6b7280" />
                    <Text style={styles.timeText}>
                      {new Date(item.created_at).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.emptyText}>{t("newOrdersScreen.noReceiptsFound")}</Text>
          )}
          <View style={styles.paginationRow}>
            <TouchableOpacity
              onPress={handlePrevious}
              disabled={page === 1 || loading || !!error}
              style={styles.pageBtn}
            >
              <Text
                style={[
                  styles.pageBtnText,
                  (page === 1 || loading || !!error) && styles.pageBtnTextDisabled,
                ]}
              >
                {t("newOrdersScreen.previous")}
              </Text>
            </TouchableOpacity>

            <Text style={styles.pageInfo}>
              {page} / {totalPages}
            </Text>

            <TouchableOpacity
              onPress={handleNext}
              disabled={page === totalPages || loading || !!error}
              style={styles.pageBtn}
            >
              <Text
                style={[
                  styles.pageBtnText,
                  (page === totalPages || loading || !!error) &&
                    styles.pageBtnTextDisabled,
                ]}
              >
                {t("common.next")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      
      </ScrollView>
  <Footer />
      {/* Image Preview */}
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

      {/* Accept Popup (Pricing / Manual entry) */}
      <Modal
        visible={showAcceptPopup && !!selectedItem}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAcceptPopup(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.acceptCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedItem?.medicines && selectedItem.medicines.length > 0 ? (
                <>
                  <Text style={styles.popupTitle}>{t("newOrdersScreen.enterPrice")}</Text>
                  {selectedItem.medicines.map((med, index) => (
                    <View key={index} style={{ marginBottom: 12 }}>
                      <Text style={styles.fieldLabel}>
                        {med.name} ({med.dosage})
                      </Text>
                      <TextInput
                        keyboardType="numeric"
                        placeholder={t("newOrdersScreen.enterPricePlaceholder")}
                        value={prices[index] || ""}
                        onChangeText={(t2) =>
                          setPrices((prev) => ({ ...prev, [index]: t2 }))
                        }
                        style={styles.input}
                      />
                    </View>
                  ))}
                  <View style={styles.popupBtnRow}>
                    <TouchableOpacity
                      onPress={() => handleAccept(selectedItem.prescription_id)}
                      disabled={isSaveDisabled()}
                      style={[
                        styles.saveBtn,
                        isSaveDisabled() && styles.saveBtnDisabled,
                      ]}
                    >
                      <Text style={styles.saveBtnText}>{t("newOrdersScreen.save")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setShowAcceptPopup(false);
                        setPrices({});
                      }}
                      style={styles.cancelBtn}
                    >
                      <Text style={styles.cancelBtnText}>{t("common.cancel")}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : !manualSafetyChecked ? (
                <>
                  <Text style={styles.popupTitle}>{t("newOrdersScreen.enterMedicineNames")}</Text>

                  {manualDrugNames.map((name, index) => (
                    <View key={index} style={{ marginBottom: 12 }}>
                      <TextInput
                        placeholder={t("newOrdersScreen.medicineNamePlaceholder")}
                        value={name}
                        onChangeText={(t2) => {
                          const updated = [...manualDrugNames];
                          updated[index] = t2;
                          setManualDrugNames(updated);
                          checkDrugName(t2, `manual-${index}`);
                        }}
                        style={styles.input}
                      />
                      {suggestion?.field === `manual-${index}` && (
                        <View style={styles.suggestionBox}>
                          <Text style={styles.suggestionText}>
                            {t("drugSuggestion.didYouMean")}{" "}
                            <Text style={styles.suggestionValue}>
                              {suggestion.value}
                            </Text>
                            ?
                          </Text>
                          <TouchableOpacity
                            onPress={() => acceptManualSuggestion(index)}
                          >
                            <Text style={styles.suggestionUseBtn}>{t("drugSuggestion.useIt")}</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={() => setManualDrugNames([...manualDrugNames, ""])}
                    style={styles.addMedicineBtn}
                  >
                    <Text style={styles.addMedicineBtnText}>
                      {t("newOrdersScreen.addAnotherMedicine")}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.popupBtnRow}>
                    <TouchableOpacity
                      onPress={handleCheckManualDrugs}
                      disabled={
                        manualDrugNames.every((n) => !n.trim()) || safetyChecking
                      }
                      style={[
                        styles.saveBtn,
                        (manualDrugNames.every((n) => !n.trim()) ||
                          safetyChecking) &&
                          styles.saveBtnDisabled,
                      ]}
                    >
                      <Text style={styles.saveBtnText}>
                        {safetyChecking ? t("newOrdersScreen.checkingSafety") : t("newOrdersScreen.checkSafetyContinue")}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setShowAcceptPopup(false);
                        setManualDrugNames([""]);
                        clearSuggestion();
                      }}
                      style={styles.cancelBtn}
                    >
                      <Text style={styles.cancelBtnText}>{t("common.cancel")}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.popupTitle}>{t("newOrdersScreen.enterPrice")}</Text>

                  {dosages.map((item, index) => (
                    <View key={index} style={styles.dosageBox}>
                      <Text style={styles.fieldLabel}>{item.dosageName}</Text>
                      <TextInput
                        placeholder={t("newOrdersScreen.addDosagePlaceholder")}
                        value={item.dosage}
                        onChangeText={(t2) => {
                          const newDosages = [...dosages];
                          newDosages[index].dosage = t2;
                          setDosages(newDosages);
                        }}
                        style={[styles.input, { marginBottom: 8 }]}
                      />
                      <TextInput
                        keyboardType="numeric"
                        placeholder={t("newOrdersScreen.addPricePlaceholder")}
                        value={item.price}
                        onChangeText={(t2) => {
                          const newDosages = [...dosages];
                          newDosages[index].price = t2;
                          setDosages(newDosages);
                        }}
                        style={styles.input}
                      />
                    </View>
                  ))}
                  <View style={styles.popupBtnRow}>
                    <TouchableOpacity
                      onPress={() => handleAccept(selectedItem.prescription_id)}
                      disabled={isSaveDisabled()}
                      style={[
                        styles.saveBtn,
                        isSaveDisabled() && styles.saveBtnDisabled,
                      ]}
                    >
                      <Text style={styles.saveBtnText}>{t("newOrdersScreen.save")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setShowAcceptPopup(false);
                        setDosages([]);
                        setManualSafetyChecked(false);
                        setManualDrugNames([""]);
                      }}
                      style={styles.cancelBtn}
                    >
                      <Text style={styles.cancelBtnText}>{t("common.cancel")}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Reject Popup */}
      <Modal
        visible={showRejectPopup && !!selectedItem}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectPopup(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.rejectCard}>
            <Text style={styles.popupTitle}>{t("newOrdersScreen.rejectReason")}</Text>
            <TextInput
              value={RejectReason}
              onChangeText={setRejectReason}
              placeholder={t("newOrdersScreen.rejectReasonPlaceholder")}
              multiline
              numberOfLines={3}
              style={[styles.input, styles.textarea]}
            />
            <View style={styles.popupBtnRow}>
              <TouchableOpacity
                disabled={rejectLoading}
                onPress={() => handleReject(selectedItem.prescription_id)}
                style={[styles.rejectConfirmBtn, rejectLoading && styles.saveBtnDisabled]}
              >
                <Text style={styles.saveBtnText}>
                  {rejectLoading ? t("newOrdersScreen.rejecting") : t("newOrdersScreen.reject")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={rejectLoading}
                onPress={() => setShowRejectPopup(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Safety Warnings Popup */}
      <Modal
        visible={showSafetyPopup && !!safetyWarnings}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSafetyPopup(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.safetyCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.safetyTitle}>{t("newOrdersScreen.safetyWarningsTitle")}</Text>

              {safetyWarnings?.interactions.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.safetySectionTitle}>{t("newOrdersScreen.drugInteractions")}</Text>
                  {safetyWarnings.interactions.map((w, i) => (
                    <View
                      key={i}
                      style={[
                        styles.warningCard,
                        w.severity === "Major"
                          ? styles.warningMajor
                          : w.severity === "Minor"
                          ? styles.warningMinor
                          : styles.warningModerate,
                      ]}
                    >
                      <Text style={styles.warningDrugs}>
                        {w.drug_a} + {w.drug_b}
                      </Text>
                      <Text
                        style={[
                          styles.warningSeverity,
                          w.severity === "Major"
                            ? styles.textMajor
                            : w.severity === "Minor"
                            ? styles.textMinor
                            : styles.textModerate,
                        ]}
                      >
                        {w.severity === "Major"
                          ? t("newOrdersScreen.major")
                          : w.severity === "Minor"
                          ? t("newOrdersScreen.minor")
                          : t("newOrdersScreen.moderate")}
                      </Text>
                      {w.severity_confidence === "UNCERTAIN" && (
                        <Text style={styles.uncertainNote}>
                          {t("createPrescription.uncertainNote")}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
              {safetyWarnings?.allergies && safetyWarnings.allergies.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.safetySectionTitle}>{t("newOrdersScreen.allergyWarnings")}</Text>
                  {safetyWarnings.allergies.map((a, i) => (
                    <View key={i} style={styles.allergyCard}>
                      <Text style={styles.allergyText}>
                        {a.medication || a.allergen}
                      </Text>
                      <Text style={styles.allergyNote}>{a.note}</Text>
                      {a.risk && (
                        <Text style={styles.allergyRisk}>{t("newOrdersScreen.risk")} {a.risk}</Text>
                      )}
                      {a.cross_reactive_drugs && a.cross_reactive_drugs.length > 0 && (
                        <View style={styles.crossReactiveSection}>
                          <Text style={styles.crossReactiveLabel}>
                            {t("newOrdersScreen.similarReactionDrugs")}
                          </Text>
                          <View style={styles.crossReactiveChips}>
                            {a.cross_reactive_drugs.slice(0, 5).map((drug, j) => (
                              <View key={j} style={styles.crossReactiveChip}>
                                <Text style={styles.crossReactiveChipText}>{drug}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {safetyWarnings?.pregnancy.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.safetySectionTitle}>{t("newOrdersScreen.pregnancyRisk")}</Text>
                  {safetyWarnings.pregnancy.map((p, i) => (
                    <View key={i} style={styles.pregnancyCard}>
                      <Text style={styles.pregnancyText}>
                        {p.medication} {t("newOrdersScreen.category")} {p.category}
                      </Text>
                      <Text style={styles.pregnancySubText}>{p.warning}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.reviewNote}>
                {t("newOrdersScreen.reviewNote")}
              </Text>

              {safetyCheckStage === "manualBeforePricing" ? (
                <TouchableOpacity
                  onPress={() => {
                    setShowSafetyPopup(false);
                    const validNames = manualDrugNames.filter((n) => n.trim() !== "");
                    proceedToManualPricing(validNames);
                    setShowAcceptPopup(true);
                    setSafetyCheckStage(null);
                  }}
                  style={styles.reviewedBtn}
                >
                  <Text style={styles.reviewedBtnText}>
                    {t("newOrdersScreen.reviewedContinuePricing")}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setShowSafetyPopup(false);
                    setShowAcceptPopup(true);
                    setSafetyCheckStage(null);
                  }}
                  style={styles.reviewedBtn}
                >
                  <Text style={styles.reviewedBtnText}>
                    {t("newOrdersScreen.reviewedContinuePricing")}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  setShowSafetyPopup(false);
                  setSafetyCheckStage(null);
                }}
                style={styles.safetyCancelBtn}
              >
                <Text style={styles.saveBtnText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0a3460",
    marginBottom: 16,
  },
  cardsWrap: {
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  patientName: {
    fontWeight: "700",
    fontSize: 16,
    color: "#111827",
  },
  sourceText: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 2,
  },
  medLine: {
    fontSize: 13,
    color: "#374151",
    marginTop: 2,
  },
  prescriptionThumb: {
    width: 96,
    height: 96,
    borderRadius: 8,
    marginTop: 10,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  acceptText: {
    color: "#16a34a",
    fontWeight: "700",
  },
  rejectText: {
    color: "#dc2626",
    fontWeight: "700",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  timeText: {
    fontSize: 12,
    color: "#6b7280",
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
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 24,
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  acceptCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    width: "90%",
    maxWidth: 420,
    maxHeight: "80%",
  },
  rejectCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
  },
  textarea: {
    height: 80,
    textAlignVertical: "top",
  },
  suggestionBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 6,
  },
  suggestionText: {
    fontSize: 12,
    color: "#92400e",
    flex: 1,
  },
  suggestionValue: {
    fontWeight: "700",
  },
  suggestionUseBtn: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400e",
    textDecorationLine: "underline",
    marginLeft: 8,
  },
  addMedicineBtn: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 14,
  },
  addMedicineBtnText: {
    fontWeight: "500",
    color: "#374151",
  },
  dosageBox: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 12,
    marginBottom: 12,
  },
  popupBtnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  saveBtn: {
    backgroundColor: "#39CCCC",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: "#374151",
    fontWeight: "600",
  },
  rejectConfirmBtn: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  safetyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 420,
    maxHeight: "85%",
  },
  safetyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 14,
  },
  safetySectionTitle: {
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  warningCard: {
    borderRadius: 10,
    borderWidth: 2,
    padding: 10,
    marginBottom: 8,
  },
  warningMajor: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  warningModerate: { borderColor: "#eab308", backgroundColor: "#fefce8" },
  warningMinor: { borderColor: "#fde68a", backgroundColor: "#fefce8" },
  warningDrugs: {
    fontWeight: "600",
    fontSize: 13,
    color: "#111827",
  },
  warningSeverity: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  textMajor: { color: "#dc2626" },
  textModerate: { color: "#a16207" },
  textMinor: { color: "#ca8a04" },
  uncertainNote: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },
  allergyCard: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fb923c",
    backgroundColor: "#fff7ed",
    padding: 10,
    marginBottom: 8,
  },
  allergyText: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
  },
  allergyNote: {
    fontSize: 12,
    color: "#374151",
    marginTop: 4,
  },
  allergyRisk: {
    fontSize: 11,
    color: "#dc2626",
    fontWeight: "700",
    marginTop: 4,
  },
  crossReactiveSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#fed7aa",
  },
  crossReactiveLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 6,
  },
  crossReactiveChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  crossReactiveChip: {
    backgroundColor: "#fed7aa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  crossReactiveChipText: {
    fontSize: 11,
    color: "#9a3412",
  },
  pregnancyCard: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#c084fc",
    backgroundColor: "#faf5ff",
    padding: 10,
    marginBottom: 8,
  },
  pregnancyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  pregnancySubText: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 2,
  },
  reviewNote: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 14,
  },
  reviewedBtn: {
    backgroundColor: "#39CCCC",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  reviewedBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  safetyCancelBtn: {
    backgroundColor: "#dc2626",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
});