import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../../utils/apiClient";
import { CHRONIC_CONDITIONS } from "../../../constants/chronicConditions";
import { useDrugSuggestion } from "../../Components/drugSuggestion/DrugSuggestion"
import { Picker } from "@react-native-picker/picker";

const toCamelCase = (str) =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

export default function EditMedicalReportModal({
  visible,
  onClose,
  report,
  onSaved,
  gender,
}) {
  const { t, i18n } = useTranslation();
  const [conditionSearch, setConditionSearch] = useState("");
  const [showConditionsPicker, setShowConditionsPicker] = useState(false);
  const { suggestion, checkDrugName, clearSuggestion } = useDrugSuggestion();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [fields, setFields] = useState({
    chronic_diseases: [],
    other_conditions: "",
    previous_surgeries: "",
    is_pregnant: "",
  });
  // Allergies and current medications are lists of individual drug names —
  // each entry gets its own resolving check, instead of splitting a single
  // free-text string on commas and hoping the fragments line up.
  const [allergies, setAllergies] = useState([""]);
  const [medications, setMedications] = useState([""]);

  useEffect(() => {
    const showEvent = Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow";
    const hideEvent = Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide";
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (report) {
      setFields({
        chronic_diseases: Array.isArray(report.chronic_diseases)
          ? report.chronic_diseases
          : [],
        other_conditions: report.other_conditions || "",
        previous_surgeries: report.previous_surgeries || "",
        is_pregnant:
          report.is_pregnant === true ? "yes"
          : report.is_pregnant === false ? "no"
          : report.is_pregnant || "",
      });
      // Existing records store these as comma-separated text — split once on
      // load so old data still populates the list UI correctly.
      const parseList = (value) => {
        if (Array.isArray(value)) return value.length ? value : [""];
        if (typeof value === "string" && value.trim()) {
          return value.split(",").map((s) => s.trim()).filter(Boolean);
        }
        return [""];
      };
      setAllergies(parseList(report.allergies));
      setMedications(parseList(report.current_medications));
    }
    clearSuggestion();
  }, [report]);

  const toggleCondition = (value) => {
    setFields((prev) => {
      const current = prev.chronic_diseases || [];
      return {
        ...prev,
        chronic_diseases: current.includes(value)
          ? current.filter((c) => c !== value)
          : [...current, value],
      };
    });
  };

  const filteredConditions = CHRONIC_CONDITIONS.filter((c) => {
    const q = conditionSearch.trim().toLowerCase();
    return !q || c.ar.includes(q) || c.en.toLowerCase().includes(q);
  });

  // ── Dynamic list helpers (shared shape for allergies + medications) ──
  const updateListItem = (setter, index, value, field) => {
    setter((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    checkDrugName(value, `${field}-${index}`);
  };

  const addListItem = (setter) => {
    setter((prev) => [...prev, ""]);
  };

  const removeListItem = (setter, index) => {
    setter((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const acceptSuggestion = (setter, index) => {
    setter((prev) => {
      const next = [...prev];
      next[index] = suggestion.value;
      return next;
    });
    clearSuggestion();
  };

  const updateReport = async () => {
    try {
      const payload = {
        ...fields,
        is_pregnant:
          fields.is_pregnant === "yes" ? true
          : fields.is_pregnant === "no" ? false
          : null,
        allergies: allergies.map((a) => a.trim()).filter(Boolean),
        current_medications: medications.map((m) => m.trim()).filter(Boolean),
      };
      const response = await apiFetch(`/api/patient/medical-record`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        onSaved();
      }
    } catch (error) {
      console.error("Update medical report error:", error);
    }
  };

  const textFieldKeys = ["other_conditions", "previous_surgeries"];

  const renderDrugList = (list, setter, field, addLabel) => (
    <View style={{ marginBottom: 12 }}>
      {list.map((value, index) => (
        <View key={index} style={{ marginBottom: 8 }}>
          <View style={styles.listRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={value}
              placeholder={t(`patientMedicalReport.${toCamelCase(field)}Placeholder`)}
              onChangeText={(text) => updateListItem(setter, index, text, field)}
            />
            {list.length > 1 && (
              <TouchableOpacity
                onPress={() => removeListItem(setter, index)}
                style={styles.removeBtn}
              >
                <Ionicons name="close-circle" size={22} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
          {suggestion?.field === `${field}-${index}` && (
            <View style={styles.suggestionBox}>
              <Text style={styles.suggestionText}>
                {t("drugSuggestion.didYouMean")}{" "}
                <Text style={styles.suggestionValue}>{suggestion.value}</Text>?
              </Text>
              <TouchableOpacity onPress={() => acceptSuggestion(setter, index)}>
                <Text style={styles.suggestionUseBtn}>
                  {t("drugSuggestion.useIt")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
      <TouchableOpacity onPress={() => addListItem(setter)} style={styles.addItemBtn}>
        <Ionicons name="add-circle-outline" size={16} color="#052443" />
        <Text style={styles.addItemText}>{addLabel}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modal, { marginBottom: keyboardHeight > 0 ? keyboardHeight + 12 : 0 }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>
              {t("patientMedicalReport.editTitle")}
            </Text>
            <Text style={styles.label}>
              {t("patientMedicalReport.chronicDiseases")}
            </Text>
            <TouchableOpacity
              onPress={() => setShowConditionsPicker(true)}
              style={styles.dropdownBtn}
            >
              <Text
                style={[
                  styles.dropdownText,
                  fields.chronic_diseases.length === 0 && styles.dropdownPlaceholder,
                ]}
                numberOfLines={1}
              >
                {fields.chronic_diseases.length > 0
                  ? t("medicalReportModal.conditionsSelected", {
                      count: fields.chronic_diseases.length,
                    })
                  : t("medicalReportModal.selectConditions")}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#9ca3af" />
            </TouchableOpacity>
            {fields.chronic_diseases.length > 0 && (
              <View style={styles.chipsRow}>
                {fields.chronic_diseases.map((value) => {
                  const cond = CHRONIC_CONDITIONS.find((c) => c.value === value);
                  const label = cond
                    ? (i18n.language?.startsWith("ar") ? cond.ar : cond.en)
                    : value;
                  return (
                    <View key={value} style={styles.chip}>
                      <Text style={styles.chipText}>{label}</Text>
                      <TouchableOpacity onPress={() => toggleCondition(value)}>
                        <Ionicons name="close-circle" size={14} color="#0e7490" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
            {(gender === "female" || gender === "أنثى") && (
              <>
                <Text style={styles.label}>
                  {t("medicalReportModal.pregnancyStatus")}
                </Text>
                <View style={styles.pregnancyOptionsRow}>
                  <TouchableOpacity
                    onPress={() => setFields({ ...fields, is_pregnant: "yes" })}
                    style={[
                      styles.pregnancyOption,
                      fields.is_pregnant === "yes" && styles.pregnancyOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pregnancyOptionText,
                        fields.is_pregnant === "yes" && styles.pregnancyOptionTextSelected,
                      ]}
                    >
                      {t("medicalReportModal.pregnant")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFields({ ...fields, is_pregnant: "no" })}
                    style={[
                      styles.pregnancyOption,
                      fields.is_pregnant === "no" && styles.pregnancyOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pregnancyOptionText,
                        fields.is_pregnant === "no" && styles.pregnancyOptionTextSelected,
                      ]}
                    >
                      {t("medicalReportModal.notPregnant")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            <Text style={styles.label}>
              {t("patientMedicalReport.allergies")}
            </Text>
            {renderDrugList(
              allergies,
              setAllergies,
              "allergies",
              t("patientMedicalReport.addAllergy")
            )}
            <Text style={styles.label}>
              {t("patientMedicalReport.currentMedications")}
            </Text>
            {renderDrugList(
              medications,
              setMedications,
              "medications",
              t("patientMedicalReport.addMedication")
            )}
            <TouchableOpacity style={styles.save} onPress={updateReport}>
              <Text style={styles.saveText}>{t("common.save")}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancel}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
      <Modal
        visible={showConditionsPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConditionsPicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                {t("patientMedicalReport.chronicDiseases")}
              </Text>
              <TouchableOpacity onPress={() => setShowConditionsPicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <TextInput
              value={conditionSearch}
              onChangeText={setConditionSearch}
              placeholder={t("medicalReportModal.searchCondition")}
              style={styles.pickerSearch}
            />
            <ScrollView style={styles.pickerList}>
              {filteredConditions.map((cond) => {
                const selected = fields.chronic_diseases.includes(cond.value);
                const label = i18n.language?.startsWith("ar") ? cond.ar : cond.en;
                return (
                  <TouchableOpacity
                    key={cond.value}
                    onPress={() => toggleCondition(cond.value)}
                    style={[styles.pickerRow, selected && styles.pickerRowSelected]}
                  >
                    <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                      {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    <Text style={[styles.pickerRowText, selected && styles.pickerRowTextSelected]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              onPress={() => {
                setConditionSearch("");
                setShowConditionsPicker(false);
              }}
              style={styles.pickerDoneBtn}
            >
              <Text style={styles.pickerDoneText}>{t("medicalReportModal.done")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    color: "#052443",
  },
  label: {
    fontWeight: "600",
    color: "#374151",
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    minHeight: 45,
  },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  dropdownPlaceholder: {
    color: "#9ca3af",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: "#a5f3fc",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    color: "#0e7490",
    fontWeight: "600",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  removeBtn: {
    padding: 2,
  },
  addItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  addItemText: {
    fontSize: 13,
    color: "#052443",
    fontWeight: "600",
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
    marginTop: 4,
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
  save: {
    backgroundColor: "#052443",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
  },
  cancel: {
    textAlign: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  pickerCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "75%",
    paddingBottom: 16,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#052443",
  },
  pickerSearch: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
  pickerList: {
    paddingHorizontal: 10,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  pickerRowSelected: {
    backgroundColor: "#f0fdff",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#39CCCC",
    borderColor: "#39CCCC",
  },
  pickerRowText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  pickerRowTextSelected: {
    color: "#0e7490",
    fontWeight: "600",
  },
  pickerDoneBtn: {
    backgroundColor: "#052443",
    marginHorizontal: 18,
    marginTop: 12,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
  },
  pickerDoneText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: Platform.OS === "ios" ? 150 : 50,
  },
  pregnancyOptionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  pregnancyOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  pregnancyOptionSelected: {
    backgroundColor: "#ecfeff",
    borderColor: "#39CCCC",
  },
  pregnancyOptionText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  pregnancyOptionTextSelected: {
    color: "#0e7490",
    fontWeight: "700",
  },
});