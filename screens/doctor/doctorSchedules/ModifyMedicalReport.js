// screens/doctorSchedules/ModifyMedicalReports.js
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import MedicalReportModal from "../../registers/patient/MedicalReportModal";

export default function ModifyMedicalReport({
  isOpen,
  onClose,
  onSave,
  medicalReport,
  patientId,
  consultationId,
}) {
  const { t } = useTranslation();
  const [editOpen, setEditOpen] = useState(false);
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
    try {
      const dataToSubmit = {
        ...formFields,
        treatment_plan: fields.treatment_plan,
        consultation_id: consultationId,
      };

      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patients/${patientId}/medical-record/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSubmit),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Medical report updated:", data);
        setEditOpen(false);
        if (onSave) onSave(dataToSubmit);
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || t("modifyMedicalReport.updateFailed"));
      }
    } catch (err) {
      console.error("Error updating medical report:", err);
      Alert.alert("Error", t("modifyMedicalReport.updateFailedRetry"));
    }
  };

  if (!isOpen || !editOpen) return null;

  return (
    <MedicalReportModal
      open={editOpen}
      onClose={() => {
        setEditOpen(false);
        if (onClose) onClose();
      }}
      onSubmit={handleLocalSubmit}
      initialValues={fields}
      isEdit={true}
    >
      <View style={styles.fieldWrapper}>
        <Text style={styles.label}>{t("modifyMedicalReport.treatmentPlan")}</Text>
        <TextInput
          value={fields.treatment_plan}
          onChangeText={(text) =>
            setFields({ ...fields, treatment_plan: text })
          }
          placeholder={t("modifyMedicalReport.treatmentPlanPlaceholder")}
          placeholderTextColor="#9ca3af"
          style={styles.input}
        />
      </View>
    </MedicalReportModal>
  );
}

const styles = StyleSheet.create({
  fieldWrapper: {
    marginBottom: 4,
  },
  label: {
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
  },
});