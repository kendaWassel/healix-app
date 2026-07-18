// screens/prescription/CreatePrescription.js
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
import { useDrugSuggestion } from "../../Components/drugSuggestion/DrugSuggestion";

const DDI_URL = "https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/ddi";

const CreatePrescription = ({ isOpen, onClose, onSave, consultationId }) => {
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", boxes: "", instructions: "" },
  ]);

  const [interactionWarnings, setInteractionWarnings] = useState([]);
  const [showInteractionPopup, setShowInteractionPopup] = useState(false);
  const [checking, setChecking] = useState(false);

  // 👇 اقتراح ضبابي لأسماء الأدوية
  const { suggestion, checkDrugName, clearSuggestion } = useDrugSuggestion();

  useEffect(() => {
    if (isOpen) {
      setShowConfirmPopup(true);
      setShowFormPopup(false);
      setDiagnosis("");
      setNotes("");
      setMedicines([{ name: "", dosage: "", boxes: "", instructions: "" }]);
      clearSuggestion();   // 👈 أضف هذا
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

    if (field === "name") {           // 👈 أضف هذا الشرط
      checkDrugName(value, `medicine-${index}`);
    }
  };

  // 👇 دالة جديدة لقبول الاقتراح
  const acceptSuggestion = (index) => {
    handleMedicineChange(index, "name", suggestion.value);
    clearSuggestion();
  };

  const checkInteractions = async () => {
    const drugNames = medicines
      .map((m) => m.name.trim())
      .filter((name) => name !== "");

    if (drugNames.length < 2) return [];

    const uniqueDrugNames = [...new Set(drugNames.map((d) => d.toLowerCase()))]
      .map((lower) => drugNames.find((d) => d.toLowerCase() === lower));

    if (uniqueDrugNames.length < 2) return [];

    const token = await AsyncStorage.getItem("token");

    try {
      const response = await fetch(`${DDI_URL}/screen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ drugs: uniqueDrugNames }),
      });
      if (!response.ok) return [];
      const result_json = await response.json();

      console.log("screen result", result_json);
      const findings = result_json.data?.findings || result_json.findings || [];
      console.log("Findings:", findings);
      console.log("Severities:", findings.map((f) => f.severity));

      const dangerous = findings.filter(
        (f) =>
          f.severity === "Major" ||
          f.severity === "Moderate" ||
          f.severity_confidence === "UNCERTAIN"
      );
      console.log("Dangerous:", dangerous);

      const withAlternatives = await Promise.all(
        dangerous.map(async (f) => {
          try {
            const res = await fetch(`${DDI_URL}/interaction`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ drug_a: f.drug_a, drug_b: f.drug_b }),
            });
            const detail_json = await res.json();
            const detail = detail_json.data || detail_json;
            return {
              ...f,
              alternatives: detail.alternatives?.candidates || [],
              alt_for: f.drug_b,
            };
          } catch {
            return { ...f, alternatives: [], alt_for: f.drug_b };
          }
        })
      );

      return withAlternatives;
    } catch (err) {
      console.error("DDI check failed:", err);
      return [];
    }
  };

  const handleSavePrescription = async () => {
    setChecking(true);
    const warnings = await checkInteractions();
    setChecking(false);

    if (warnings.length > 0) {
      setInteractionWarnings(warnings);
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
        Alert.alert("Error", errorData.message || "Failed to save prescription");
      }
    } catch (err) {
      console.error("Error saving prescription:", err);
      Alert.alert("Error", "Failed to save prescription. Please try again.");
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
            <Text style={styles.confirmTitle}>Create Prescription</Text>
            <Text style={styles.confirmText}>
              Do you want to create a prescription for this patient?
            </Text>

            <View style={{ gap: 12, width: "100%" }}>
              <TouchableOpacity
                onPress={() => {
                  setShowConfirmPopup(false);
                  setShowFormPopup(true);
                }}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowConfirmPopup(false);
                  if (onClose) onClose();
                }}
                style={styles.dangerBtn}
              >
                <Text style={styles.dangerBtnText}>No</Text>
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
              <Text style={styles.formTitle}>Prescription Details</Text>

              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>Diagnosis</Text>
                <TextInput
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  placeholder="Enter diagnosis"
                  style={styles.input}
                />
              </View>

              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="General notes"
                  multiline
                  numberOfLines={3}
                  style={[styles.input, styles.textarea]}
                />
              </View>

              <Text style={styles.sectionTitle}>Medicines</Text>

              {medicines.map((med, index) => (
                <View key={index} style={styles.medicineBox}>
                  <TextInput
                    placeholder="Medicine Name"
                    value={med.name}
                    onChangeText={(t) => handleMedicineChange(index, "name", t)}
                    style={[styles.input, { marginBottom: 8 }]}
                  />

                  {/* 👇 صندوق الاقتراح الجديد */}
                  {suggestion?.field === `medicine-${index}` && (
                    <View style={styles.suggestionBox}>
                      <Text style={styles.suggestionText}>
                        Did you mean{" "}
                        <Text style={styles.suggestionValue}>
                          {suggestion.value}
                        </Text>
                        ?
                      </Text>
                      <TouchableOpacity onPress={() => acceptSuggestion(index)}>
                        <Text style={styles.suggestionUseBtn}>Use it</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <TextInput
                    placeholder="Dosage (e.g., 500mg)"
                    value={med.dosage}
                    onChangeText={(t) => handleMedicineChange(index, "dosage", t)}
                    style={[styles.input, { marginBottom: 8 }]}
                  />
                  <TextInput
                    placeholder="Boxes"
                    value={med.boxes}
                    onChangeText={(t) => handleMedicineChange(index, "boxes", t)}
                    keyboardType="numeric"
                    style={[styles.input, { marginBottom: 8 }]}
                  />
                  <TextInput
                    placeholder="Instructions"
                    value={med.instructions}
                    onChangeText={(t) =>
                      handleMedicineChange(index, "instructions", t)
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
                  + Add Another Medicine
                </Text>
              </TouchableOpacity>

              <View style={{ gap: 12, marginTop: 8 }}>
                <TouchableOpacity
                  onPress={handleSavePrescription}
                  disabled={checking}
                  style={[styles.primaryBtn, checking && styles.btnDisabled]}
                >
                  <Text style={styles.primaryBtnText}>
                    {checking ? "Checking Interactions ..." : "Save Prescription"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowFormPopup(false);
                    if (onClose) onClose();
                  }}
                  style={styles.dangerBtn}
                >
                  <Text style={styles.dangerBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Interaction Warning Popup */}
      <Modal
        visible={showInteractionPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInteractionPopup(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.formCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.warningTitle}>Warning : Drug Interaction ⚠️</Text>
              <Text style={styles.warningSubtitle}>
                Interaction between this Drugs :
              </Text>

              <View style={{ gap: 12, marginBottom: 20 }}>
                {interactionWarnings.map((w, i) => (
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
                      Severity :{" "}
                      {w.severity === "Major"
                        ? "Major 🔴"
                        : w.severity === "Minor"
                        ? "Minor 🟡"
                        : "Moderate 🟠"}
                    </Text>

                    {w.severity_confidence === "UNCERTAIN" && (
                      <Text style={styles.uncertainNote}>
                        Model estimate only — verify clinically.
                      </Text>
                    )}

                    {w.alternatives && w.alternatives.length > 0 && (
                      <View style={styles.altSection}>
                        <Text style={styles.altLabel}>
                          Alternatives Suggestions:{" "}
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
                          Initial Suggestions - Doctor Decides
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              <View style={{ gap: 12 }}>
                <TouchableOpacity onPress={saveToServer} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>
                    I Understood the Risks - Save Prescription
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowInteractionPopup(false)}
                  style={styles.dangerBtn}
                >
                  <Text style={styles.dangerBtnText}>Cancel - Edit Drugs</Text>
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
  // 👇 أنماط جديدة لصندوق الاقتراح
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
});

export default CreatePrescription;