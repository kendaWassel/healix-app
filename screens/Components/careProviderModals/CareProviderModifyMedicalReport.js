import { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MedicalReportModal from "../../../screens/registers/patient/MedicalReportModal";
import { colors } from "../../../constants/colors";
import { BASE_URL, NGROK_HEADERS } from "../../../constants/colors";

export default function CareProviderModifyMedicalReport({
  isOpen,
  onClose,
  onSave,
  medicalReport,
  patientId,
  sessionId,
  providerType = "physiotherapist",
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState({
    diagnosis: "",
    chronic_diseases: "",
    previous_surgeries: "",
    allergies: "",
    current_medications: "",
    treatment_plan: "",
  });

  useEffect(() => {
    if (isOpen) {
      setEditOpen(true);
      setError(null);
      if (medicalReport) {
        setFields({
          diagnosis: medicalReport.diagnosis || "",
          chronic_diseases: medicalReport.chronic_diseases || "",
          previous_surgeries: medicalReport.previous_surgeries || "",
          allergies: medicalReport.allergies || "",
          current_medications: medicalReport.current_medications || "",
          treatment_plan: medicalReport.treatment_plan || "",
        });
      }
    }
  }, [isOpen, medicalReport]);

  const handleLocalSubmit = async (formFields) => {
    const token = await AsyncStorage.getItem("token");
    setError(null);

    try {
      const dataToSubmit = {
        ...formFields,
        treatment_plan: fields.treatment_plan,
        session_id: sessionId,
      };

      const response = await fetch(
        `${BASE_URL}/patients/${patientId}/medical-record/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSubmit),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Medical report updated:", data);
        setError(null);
        setEditOpen(false);
        if (onSave) onSave(dataToSubmit);
      } else {
        setError("Failed to save try again");
      }
    } catch (err) {
      console.error("Error updating medical report:", err);
      setError("Failed to save try again");
    }
  };

  if (!isOpen || !editOpen) return null;

  return (
    <MedicalReportModal
      open={editOpen}
      onClose={() => {
        setEditOpen(false);
        setError(null);
        if (onClose) onClose();
      }}
      onSubmit={handleLocalSubmit}
      initialValues={fields}
      isEdit={true}
      errorMessage={error}
    >
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Treatment Plan</Text>
        <TextInput
          style={styles.input}
          placeholder="Treatment Plan ..."
          value={fields.treatment_plan}
          onChangeText={(val) => setFields({ ...fields, treatment_plan: val })}
        />
      </View>
    </MedicalReportModal>
  );
}

const styles = StyleSheet.create({
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: colors.gray700, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.gray800,
  },
});
