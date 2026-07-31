import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useTranslation } from "react-i18next";
import { CHRONIC_CONDITIONS } from "../../../constants/chronicConditions";
import { apiFetch } from "../../../utils/apiClient";




export const uploadImage = async (photoFile) => {
  const formData = new FormData();
  formData.append("image", {
    uri: photoFile.uri, name: "photo.jpg", type: "image/jpeg",
  });
  formData.append("category", "report");
  const res = await apiFetch(`/api/uploads/image`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Image upload failed");
  return (await res.json()).image_id;
};

export const uploadFile = async (medicalFile) => {
  const formData = new FormData();
  formData.append("file", {
    uri: medicalFile.uri,
    name: medicalFile.name,
    type: medicalFile.mimeType || "application/pdf",
  });
  formData.append("category", "report");
  const res = await apiFetch(`/api/uploads`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("File upload failed");
  return (await res.json()).file_id;
};

export default function MedicalReportModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  isEdit,
  children,
  errorMessage,
  gender,
}) {
  const { t, i18n } = useTranslation(); 
  const [conditionSearch, setConditionSearch] = useState("");
  const [fields, setFields] = useState({
    diagnosis: "",
    chronic_diseases: [],
    other_conditions: "",  
    previous_surgeries: "",
    allergies: "",
    current_medications: "",
    is_pregnant: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [medicalFile, setMedicalFile] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (open && initialValues) {
      setFields({
        diagnosis: initialValues.diagnosis || "",
        chronic_diseases: Array.isArray(initialValues.chronic_diseases)
        ? initialValues.chronic_diseases
        : [],
        other_conditions: initialValues.other_conditions || "",
        previous_surgeries: initialValues.previous_surgeries || "",
        allergies: initialValues.allergies || "",
        current_medications: initialValues.current_medications || "",
        is_pregnant: initialValues.is_pregnant || "",
      });
      setPhotoFile(initialValues.photoFile || null);
      setMedicalFile(initialValues.medicalFile || null);
    } else if (open) {
      setFields({
        diagnosis: "",
        chronic_diseases: [],
        other_conditions: "",
        previous_surgeries: "",
        allergies: "",
        current_medications: "",
        is_pregnant: "",
      });
      setPhotoFile(null);
      setMedicalFile(null);
      setPhotoName("");
      setFileName("");
    }
  }, [open, initialValues]);

  const pickPhoto = async () => {
    if (isEdit) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoFile(result.assets[0]);
      setPhotoName(result.assets[0].fileName || t("medicalReportModal.medicalPhotos"));
    }
  };

  const pickDocument = async () => {
    if (isEdit) return;
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      setMedicalFile(result.assets[0]);
      setFileName(result.assets[0].name);
    }
  };

  const handleSubmit = async () => {
    await onSubmit({ ...fields, photoFile, medicalFile });
  };

  const filteredConditions = CHRONIC_CONDITIONS.filter((c) => {
  const q = conditionSearch.trim().toLowerCase();
  return !q || c.ar.includes(q) || c.en.toLowerCase().includes(q);
});

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

  return (
    <Modal visible={open} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalWrap}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t("medicalReportModal.title")}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            <Text style={styles.label}>{t("medicalReportModal.diagnosis")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("medicalReportModal.diagnosisPlaceholder")}
              value={fields.diagnosis}
              onChangeText={(t2) => setFields({ ...fields, diagnosis: t2 })}
            />

            <TouchableOpacity
              style={[styles.fileBtn, isEdit && styles.fileBtnDisabled]}
              onPress={pickPhoto}
              disabled={isEdit}
            >
              <Ionicons name="image" size={18} color={isEdit ? "#aaa" : "#333"} />
              <Text style={[styles.fileBtnText, isEdit && styles.fileBtnTextDisabled]}>
                {photoName || t("medicalReportModal.medicalPhotos")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.fileBtn, isEdit && styles.fileBtnDisabled]}
              onPress={pickDocument}
              disabled={isEdit}
            >
              <Ionicons name="document-text" size={18} color={isEdit ? "#aaa" : "#333"} />
              <Text style={[styles.fileBtnText, isEdit && styles.fileBtnTextDisabled]}>
                {fileName || t("medicalReportModal.medicalFiles")}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>{t("medicalReportModal.chronicDiseases")}</Text>
            <TextInput
              style={[styles.input, isEdit && styles.inputDisabled]}
              placeholder={t("medicalReportModal.chronicDiseasesPlaceholder")}
              value={fields.chronic_diseases}
              onChangeText={(t2) => setFields({ ...fields, chronic_diseases: t2 })}
              editable={!isEdit}
            />

                <Text style={styles.label}>{t("medicalReportModal.chronicDiseases")}</Text>
          <Text style={styles.hint}>{t("medicalReportModal.chronicDiseasesHint")}</Text>

          <TextInput
            value={conditionSearch}
            onChangeText={setConditionSearch}
            placeholder={t("medicalReportModal.searchCondition")}
            style={[styles.input, { marginBottom: 8 }, isEdit && styles.inputDisabled]}
            editable={!isEdit}
          />

        
          <View style={styles.chipsWrap}>
            {filteredConditions.map((cond) => {
              const selected = (fields.chronic_diseases || []).includes(cond.value);
              const label = i18n.language?.startsWith("ar") ? cond.ar : cond.en;
              return (
                <TouchableOpacity
                  key={cond.value}
                  onPress={() => !isEdit && toggleCondition(cond.value)}
                  disabled={isEdit}
                  style={[
                    styles.conditionChip,
                    selected && styles.conditionChipSelected,
                    isEdit && styles.conditionChipDisabled,
                  ]}
                >
                  {selected && <Ionicons name="checkmark" size={13} color="#0e7490" />}
                  <Text style={[styles.conditionChipText, selected && styles.conditionChipTextSelected]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
        
          <Text style={styles.label}>{t("medicalReportModal.otherConditions")}</Text>
          <Text style={styles.hint}>{t("medicalReportModal.otherConditionsNote")}</Text> 
          <TextInput
            style={[styles.input, isEdit && styles.inputDisabled]}
            placeholder={t("medicalReportModal.otherConditionsPlaceholder")}
            value={fields.other_conditions}
            onChangeText={(t2) => setFields({ ...fields, other_conditions: t2 })}
            editable={!isEdit}
          />
            <Text style={styles.label}>{t("medicalReportModal.allergies")}</Text>
            <TextInput
              style={[styles.input, isEdit && styles.inputDisabled]}
              placeholder={t("medicalReportModal.allergiesPlaceholder")}
              value={fields.allergies}
              onChangeText={(t2) => setFields({ ...fields, allergies: t2 })}
              editable={!isEdit}
            />

           {(gender === "female" || gender === "أنثى") && (
              <>
                <Text style={styles.label}>{t("medicalReportModal.pregnancyStatus")}</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={fields.is_pregnant}
                    onValueChange={(v) => setFields({ ...fields, is_pregnant: v })}
                    style={styles.picker}
                  >
                    <Picker.Item label={t("medicalReportModal.select")} value="" />
                    <Picker.Item label={t("medicalReportModal.pregnant")} value="yes" />
                    <Picker.Item label={t("medicalReportModal.notPregnant")} value="no" />
                  </Picker>
                </View>
              </>
            )}

            <Text style={styles.label}>{t("medicalReportModal.currentMedications")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("medicalReportModal.currentMedicationsPlaceholder")}
              value={fields.current_medications}
              onChangeText={(t2) => setFields({ ...fields, current_medications: t2 })}
            />

            {children}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                <Text style={styles.saveBtnText}>{t("medicalReportModal.saveReport")}</Text>
              </TouchableOpacity>
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalWrap: {
    backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 20, borderBottomWidth: 1, borderBottomColor: "#eee",
  },
  title: { fontSize: 18, fontWeight: "700" },
  body: { paddingHorizontal: 20, paddingTop: 10 },
  label: { fontWeight: "600", color: "#333", marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
  },
  inputDisabled: {
    backgroundColor: "#f3f4f6",
    color: "#9ca3af",
    borderColor: "#e5e7eb",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: Platform.OS === "ios" ? 150 : 50,
  },
  fileBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    padding: 12, marginTop: 12,
  },
  fileBtnDisabled: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
  },
  fileBtnText: { color: "#666", fontSize: 14 },
  fileBtnTextDisabled: { color: "#aaa" },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: "#eee" },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#2563eb", padding: 14, borderRadius: 8, alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700" },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
  hint: {
  fontSize: 11,
  color: "#9ca3af",
  marginBottom: 8,
},
chipsWrap: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 8,
},
conditionChip: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  paddingHorizontal: 12,
  paddingVertical: 7,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#d1d5db",
  backgroundColor: "#fff",
},
conditionChipSelected: {
  backgroundColor: "#ecfeff",
  borderColor: "#39CCCC",
},
conditionChipDisabled: {
  opacity: 0.5,
},
conditionChipText: {
  fontSize: 12,
  color: "#374151",
},
conditionChipTextSelected: {
  color: "#0e7490",
  fontWeight: "600",
},
});