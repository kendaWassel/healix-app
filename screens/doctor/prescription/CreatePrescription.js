import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useDrugSuggestion } from "../../Components/drugSuggestion/DrugSuggestion";

const CreatePrescription = ({ isOpen, onClose, onSave, consultationId, patientId }) => {
  const { t } = useTranslation();
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", boxes: "", instructions: "" },
  ]);

  const [interactionWarnings, setInteractionWarnings] = useState([]);
  const [allergyWarnings, setAllergyWarnings] = useState([]);
  const [pregnancyWarnings, setPregnancyWarnings] = useState([]);
  const [showInteractionPopup, setShowInteractionPopup] = useState(false);
  const [checking, setChecking] = useState(false);

  const { suggestion, checkDrugName, clearSuggestion } = useDrugSuggestion();

  useEffect(() => {
    if (isOpen) {
      setShowConfirmPopup(true);
      setShowFormPopup(false);
      setDiagnosis("");
      setNotes("");
      setMedicines([{ name: "", dosage: "", boxes: "", instructions: "" }]);
      clearSuggestion();
    }
  }, [isOpen]);

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: "", dosage: "", boxes: "", instructions: "" },
    ]);
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);

    if (field === "name") {
      checkDrugName(value, `medicine-${index}`);
    }
  };

  const acceptSuggestion = (index) => {
    handleMedicineChange(index, "name", suggestion.value);
    clearSuggestion();
  };

  const checkInteractions = async () => {
    const drugNames = medicines
      .map((m) => m.name.trim())
      .filter((name) => name !== "");

    if (drugNames.length < 2) return { hasWarning: false };

    const uniqueDrugNames = [...new Set(drugNames.map((d) => d.toLowerCase()))]
      .map((lower) => drugNames.find((d) => d.toLowerCase() === lower));

    if (uniqueDrugNames.length < 2) return { hasWarning: false };

    const token = await AsyncStorage.getItem("token");

    try {
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/doctor/prescriptions/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ medications: uniqueDrugNames, patient_id: patientId }),
        }
      );

      if (!response.ok) return { hasWarning: false };
      const result_json = await response.json();
      console.log("verify result", result_json);

      const data = result_json.data || result_json;

      const dangerous = (data.drug_interactions || []).filter(
        (f) =>
          f.severity === "Major" ||
          f.severity === "Moderate" ||
          f.severity_confidence === "UNCERTAIN"
      );

      const withAlternatives = dangerous.map((f) => ({
        ...f,
        alternatives: f.alternatives?.candidates || [],
        alt_for: f.drug_b,
      }));

      return {
        interactions: withAlternatives,
        allergies: data.allergy_warnings || [],
        pregnancy: data.pregnancy_warnings || [],
        hasWarning: data.safe === false,
      };
    } catch (err) {
      console.error("DDI check failed:", err);
      return { hasWarning: false };
    }
  };

  const handleSavePrescription = async () => {
    setChecking(true);
    const result = await checkInteractions();
    setChecking(false);

    if (result.hasWarning) {
      setInteractionWarnings(result.interactions || []);
      setAllergyWarnings(result.allergies || []);
      setPregnancyWarnings(result.pregnancy || []);
      setShowInteractionPopup(true);
      return;
    }

    await saveToServer();
  };

  const saveToServer = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/doctor/prescriptions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            consultation_id: consultationId,
            diagnosis,
            notes,
            medicines,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Prescription saved:", data);
        setShowInteractionPopup(false);
        if (onSave) onSave();
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || t("createPrescription.saveFailed"));
      }
    } catch (err) {
      console.error("Error saving prescription:", err);
      Alert.alert("Error", t("createPrescription.saveFailedRetry"));
    }
  };

  return (
    <>
      {/* Confirm Popup */}
      <Modal
        visible={showConfirmPopup}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.overlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>{t("createPrescription.createTitle")}</Text>
            <Text style={styles.confirmText}>
              {t("createPrescription.createConfirm")}
            </Text>

            <View style={{ gap: 12, width: "100%" }}>
              <TouchableOpacity
                onPress={() => {
                  setShowConfirmPopup(false);
                  setShowFormPopup(true);
                }}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>{t("createPrescription.yes")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowConfirmPopup(false);
                  if (onClose) onClose();
                }}
                style={styles.dangerBtn}
              >
                <Text style={styles.dangerBtnText}>{t("createPrescription.no")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Prescription Form */}
      <Modal
        visible={showFormPopup}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.overlay}>
          <View style={styles.formCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formTitle}>{t("createPrescription.prescriptionDetails")}</Text>

              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>{t("createPrescription.diagnosis")}</Text>
                <TextInput
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  placeholder={t("createPrescription.diagnosisPlaceholder")}
                  style={styles.input}
                />
              </View>

              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>{t("createPrescription.notes")}</Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder={t("createPrescription.notesPlaceholder")}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, styles.textarea]}
                />
              </View>

              <Text style={styles.sectionTitle}>{t("createPrescription.medicines")}</Text>

              {medicines.map((med, index) => (
                <View key={index} style={styles.medicineBox}>
                  <TextInput
                    placeholder={t("createPrescription.medicineNamePlaceholder")}
                    value={med.name}
                    onChangeText={(t2) => handleMedicineChange(index, "name", t2)}
                    style={[styles.input, { marginBottom: 8 }]}
                  />

                  {suggestion?.field === `medicine-${index}` && (
                    <View style={styles.suggestionBox}>
                      <Text style={styles.suggestionText}>
                        {t("drugSuggestion.didYouMean")}{" "}
                        <Text style={styles.suggestionValue}>
                          {suggestion.value}
                        </Text>
                        ?
                      </Text>
                      <TouchableOpacity onPress={() => acceptSuggestion(index)}>
                        <Text style={styles.suggestionUseBtn}>{t("drugSuggestion.useIt")}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <TextInput
                    placeholder={t("createPrescription.dosagePlaceholder")}
                    value={med.dosage}
                    onChangeText={(t2) => handleMedicineChange(index, "dosage", t2)}
                    style={[styles.input, { marginBottom: 8 }]}
                  />
                  <TextInput
                    placeholder={t("createPrescription.boxesPlaceholder")}
                    value={med.boxes}
                    onChangeText={(t2) => handleMedicineChange(index, "boxes", t2)}
                    keyboardType="numeric"
                    style={[styles.input, { marginBottom: 8 }]}
                  />
                  <TextInput
                    placeholder={t("createPrescription.instructionsPlaceholder")}
                    value={med.instructions}
                    onChangeText={(t2) =>
                      handleMedicineChange(index, "instructions", t2)
                    }
                    style={styles.input}
                  />
                </View>
              ))}

              <TouchableOpacity
                onPress={handleAddMedicine}
                style={styles.addMedicineBtn}
              >
                <Text style={styles.addMedicineBtnText}>
                  {t("createPrescription.addAnotherMedicine")}
                </Text>
              </TouchableOpacity>

              <View style={{ gap: 12, marginTop: 8 }}>
                <TouchableOpacity
                  onPress={handleSavePrescription}
                  disabled={checking}
                  style={[styles.primaryBtn, checking && styles.btnDisabled]}
                >
                  <Text style={styles.primaryBtnText}>
                    {checking ? t("createPrescription.checkingSafety") : t("createPrescription.savePrescription")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowFormPopup(false);
                    if (onClose) onClose();
                  }}
                  style={styles.dangerBtn}
                >
                  <Text style={styles.dangerBtnText}>{t("createPrescription.cancel")}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Safety Warnings Popup */}
      <Modal
        visible={showInteractionPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInteractionPopup(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.formCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.warningTitle}>{t("createPrescription.safetyWarningTitle")}</Text>
              <Text style={styles.warningSubtitle}>
                {t("createPrescription.reviewBeforeSaving")}
              </Text>

              <View style={{ gap: 12, marginBottom: 20 }}>
                {interactionWarnings.map((w, i) => (
                  <View
                    key={`int-${i}`}
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
                      🔴 {w.drug_a} + {w.drug_b}
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
                      {t("createPrescription.severity")}{" "}
                      {w.severity === "Major"
                        ? t("createPrescription.major")
                        : w.severity === "Minor"
                        ? t("createPrescription.minor")
                        : t("createPrescription.moderate")}
                    </Text>

                    {w.severity_confidence === "UNCERTAIN" && (
                      <Text style={styles.uncertainNote}>
                        {t("createPrescription.uncertainNote")}
                      </Text>
                    )}

                    {w.alternatives && w.alternatives.length > 0 && (
                      <View style={styles.altSection}>
                        <Text style={styles.altLabel}>
                          {t("createPrescription.alternativesSuggestions")}{" "}
                          <Text style={{ fontWeight: "700" }}>{w.alt_for}</Text>
                        </Text>
                        <View style={styles.altChips}>
                          {w.alternatives.slice(0, 4).map((alt, j) => (
                            <View key={j} style={styles.altChip}>
                              <Text style={styles.altChipText}>{alt.name}</Text>
                            </View>
                          ))}
                        </View>
                        <Text style={styles.altNote}>
                          {t("createPrescription.initialSuggestions")}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}

                {allergyWarnings.map((a, i) => (
                  <View key={`alg-${i}`} style={styles.allergyCard}>
                    <Text style={styles.allergyText}>
                      🤧 {t("createPrescription.patientAllergicTo")}{" "}
                      <Text style={{ fontWeight: "700" }}>
                        {a.medication || a.allergen}
                      </Text>
                    </Text>
                    <Text style={styles.allergyNote}>{a.note}</Text>
                    {a.risk && (
                      <Text style={styles.allergyRisk}>{t("createPrescription.risk")} {a.risk}</Text>
                    )}
                    {a.cross_reactive_drugs && a.cross_reactive_drugs.length > 0 && (
                      <View style={styles.altSection}>
                        <Text style={styles.altLabel}>
                          {t("createPrescription.similarReactionDrugs")}
                        </Text>
                        <View style={styles.altChips}>
                          {a.cross_reactive_drugs.slice(0, 5).map((drug, j) => (
                            <View key={j} style={styles.allergyChip}>
                              <Text style={styles.allergyChipText}>{drug}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                ))}

                {pregnancyWarnings.map((p, i) => (
                  <View key={`preg-${i}`} style={styles.pregnancyCard}>
                    <Text style={styles.pregnancyText}>
                      🤰 {p.medication} — {t("createPrescription.category")} {p.category}
                    </Text>
                    <Text style={styles.pregnancySubText}>{p.warning}</Text>
                  </View>
                ))}
              </View>
              <View style={{ gap: 12 }}>
                <TouchableOpacity onPress={saveToServer} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>
                    {t("createPrescription.understoodRisks")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowInteractionPopup(false)}
                  style={styles.dangerBtn}
                >
                  <Text style={styles.dangerBtnText}>{t("createPrescription.cancelEditDrugs")}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(5,36,67,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  confirmText: {
    color: "#374151",
    marginBottom: 20,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 420,
    maxHeight: "80%",
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  fieldWrapper: {
    marginBottom: 14,
  },
  label: {
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    width: "100%",
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },
  medicineBox: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
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
    marginBottom: 8,
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
  primaryBtn: {
    width: "100%",
    backgroundColor: "#052443",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerBtn: {
    width: "100%",
    backgroundColor: "#e71313",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  dangerBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 6,
  },
  warningSubtitle: {
    color: "#374151",
    textAlign: "center",
    marginBottom: 16,
  },
  warningCard: {
    borderRadius: 10,
    borderWidth: 2,
    padding: 12,
  },
  warningMajor: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  warningModerate: { borderColor: "#eab308", backgroundColor: "#fefce8" },
  warningMinor: { borderColor: "#fde68a", backgroundColor: "#fefce8" },
  warningDrugs: {
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  warningSeverity: {
    fontSize: 13,
    fontWeight: "700",
  },
  textMajor: { color: "#dc2626" },
  textModerate: { color: "#a16207" },
  textMinor: { color: "#ca8a04" },
  uncertainNote: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },
  altSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
  },
  altLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 6,
  },
  altChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  altChip: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  altChipText: {
    fontSize: 11,
    color: "#166534",
  },
  altNote: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 4,
  },
  allergyCard: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fb923c",
    backgroundColor: "#fff7ed",
    padding: 12,
  },
  allergyText: {
    fontWeight: "600",
    color: "#111827",
    fontSize: 13,
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
  allergyChip: {
    backgroundColor: "#fed7aa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  allergyChipText: {
    fontSize: 11,
    color: "#9a3412",
  },
  pregnancyCard: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#c084fc",
    backgroundColor: "#faf5ff",
    padding: 12,
  },
  pregnancyText: {
    fontWeight: "600",
    fontSize: 13,
    color: "#111827",
  },
  pregnancySubText: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 2,
  },
});

export default CreatePrescription;