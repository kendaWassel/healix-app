import React, { useEffect } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { apiFetch } from "../../../utils/apiClient";


export default function ModifyMedicalReport({
  isOpen,
  onClose,
  onSave,
  medicalReport,
  patientId,
  consultationId,
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleLocalSubmit = async (formFields) => {
    try {
      const dataToSubmit = {
        ...formFields,
        consultation_id: consultationId,
      };
      const response = await apiFetch(`/api/patients/${patientId}/medical-record/update`, {
        method: "PUT",
        body: JSON.stringify(dataToSubmit),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Medical report updated:", data);
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

  useEffect(() => {
    if (isOpen) {
      const fields = {
        diagnosis: medicalReport?.diagnosis || "",
        chronic_diseases: medicalReport?.chronic_diseases || "",
        previous_surgeries: medicalReport?.previous_surgeries || "",
        allergies: medicalReport?.allergies || "",
        current_medications: medicalReport?.current_medications || "",
        treatment_plan: medicalReport?.treatment_plan || "",
      };
      navigation.navigate("MedicalReportScreen", {
        initialValues: fields,
        isEdit: true,
        showTreatmentPlan: true,
        onSubmit: handleLocalSubmit,
      });
      if (onClose) onClose();
    }
  }, [isOpen]);

  return null;
}