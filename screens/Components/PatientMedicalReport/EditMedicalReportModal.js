import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../../utils/apiClient";
import { CHRONIC_CONDITIONS } from "../../../constants/chronicConditions";
import { PRE_EXISTING_CONDITIONS } from "../../../constants/preExistingConditions";
import { useDrugSuggestion } from "../../Components/drugSuggestion/DrugSuggestion";

const toCamelCase = (str) =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

export default function EditMedicalReportModal({ navigation, route }) {
  const { report, onSaved, gender } = route.params || {};
  const { t, i18n } = useTranslation();
  const [conditionSearch, setConditionSearch] = useState("");
  const [showConditionsPicker, setShowConditionsPicker] = useState(false);
  const [preExistingSearch, setPreExistingSearch] = useState("");
  const [showPreExistingPicker, setShowPreExistingPicker] = useState(false);
  const { suggestion, checkDrugName, clearSuggestion } = useDrugSuggestion();
  const [fields, setFields] = useState({
    chronic_diseases: [],
    pre_existing_conditions: [],
    other_conditions: "",
    previous_surgeries: "",
    is_pregnant: "",
  });
  const [allergies, setAllergies] = useState([""]);
  const [medications, setMedications] = useState([""]);

  useEffect(() => {
    if (report) {
      setFields({
        chronic_diseases: Array.isArray(report.chronic_diseases)
          ? report.chronic_diseases
          : [],
        pre_existing_conditions: Array.isArray(report.pre_existing_conditions)
          ? report.pre_existing_conditions
          : [],
        other_conditions: report.other_conditions || "",
        previous_surgeries: report.previous_surgeries || "",
        is_pregnant:
          report.is_pregnant === true ? "yes"
          : report.is_pregnant === false ? "no"
          : report.is_pregnant || "",
      });
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

  const togglePreExisting = (value) => {
    setFields((prev) => {
      const current = prev.pre_existing_conditions || [];
      return {
        ...prev,
        pre_existing_conditions: current.includes(value)
          ? current.filter((c) => c !== value)
          : [...current, value],
      };
    });
  };

  const filteredConditions = CHRONIC_CONDITIONS.filter((c) => {
    const q = conditionSearch.trim().toLowerCase();
    return !q || c.ar.includes(q) || c.en.toLowerCase().includes(q);
  });

  const filteredPreExisting = PRE_EXISTING_CONDITIONS.filter((c) => {
    const q = preExistingSearch.trim().toLowerCase();
    return !q || c.ar.includes(q) || c.en.toLowerCase().includes(q);
  });

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
        if (onSaved) onSaved();
        navigation.goBack();
      }
    } catch (error) {
      console.error("Update medical report error:", error);
    }
  };

  const renderDrugList = (list, setter, field, addLabel) => (
    <View style={{ marginBottom: 12 }}>
      {list.map((value, index) => (
        <View key={index} style={{ marginBottom: 8 }}>
          <View style={styles.listRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={value}
              placeholder={t(`patientMedicalReport.${toCamelCase(field)}Placeholder`)}
              placeholderTextColor="#6B7280"
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
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t("patientMedicalReport.editTitle")}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color="#666" />
        </TouchableOpacity>
      </View>
      <KeyboardAwareScrollView
        style={styles.body}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
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

        {/* Pre-existing conditions — same dropdown pattern as chronic diseases */}
        <Text style={styles.label}>
          {t("medicalReportModal.preExistingConditions")}
        </Text>
        <TouchableOpacity
          onPress={() => setShowPreExistingPicker(true)}
          style={styles.dropdownBtn}
        >
          <Text
            style={[
              styles.dropdownText,
              (fields.pre_existing_conditions || []).length === 0 && styles.dropdownPlaceholder,
            ]}
            numberOfLines={1}
          >
            {(fields.pre_existing_conditions || []).length > 0
              ? t("medicalReportModal.conditionsSelected", {
                  count: fields.pre_existing_conditions.length,
                })
              : t("medicalReportModal.selectConditions")}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#9ca3af" />
        </TouchableOpacity>
        {(fields.pre_existing_conditions || []).length > 0 && (
          <View style={styles.chipsRow}>
            {fields.pre_existing_conditions.map((value) => {
              const cond = PRE_EXISTING_CONDITIONS.find((c) => c.value === value);
              const label = cond
                ? (i18n.language?.startsWith("ar") ? cond.ar : cond.en)
                : value;
              return (
                <View key={value} style={styles.chip}>
                  <Text style={styles.chipText}>{label}</Text>
                  <TouchableOpacity onPress={() => togglePreExisting(value)}>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>{t("common.cancel")}</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

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
              placeholderTextColor="#6B7280"
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

      <Modal
        visible={showPreExistingPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPreExistingPicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                {t("medicalReportModal.preExistingConditions")}
              </Text>
              <TouchableOpacity onPress={() => setShowPreExistingPicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <TextInput
              value={preExistingSearch}
              onChangeText={setPreExistingSearch}
              placeholder={t("medicalReportModal.searchCondition")}
              placeholderTextColor="#6B7280"
              style={styles.pickerSearch}
            />
            <ScrollView style={styles.pickerList}>
              {filteredPreExisting.map((cond) => {
                const selected = (fields.pre_existing_conditions || []).includes(cond.value);
                const label = i18n.language?.startsWith("ar") ? cond.ar : cond.en;
                return (
                  <TouchableOpacity
                    key={cond.value}
                    onPress={() => togglePreExisting(cond.value)}
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
              {filteredPreExisting.length === 0 && (
                <Text style={styles.pickerEmpty}>
                  {t("medicalReportModal.noConditionsFound")}
                </Text>
              )}
            </ScrollView>
            <TouchableOpacity
              onPress={() => {
                setPreExistingSearch("");
                setShowPreExistingPicker(false);
              }}
              style={styles.pickerDoneBtn}
            >
              <Text style={styles.pickerDoneText}>{t("medicalReportModal.done")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#052443",
  },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  label: {
    fontWeight: "600",
    color: "#374151",
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#052443" ,
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
    marginBottom: 20,
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
  pickerEmpty: {
    textAlign: "center",
    color: "#9ca3af",
    paddingVertical: 24,
    fontSize: 13,
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