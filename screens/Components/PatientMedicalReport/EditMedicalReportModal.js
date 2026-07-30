import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";


import { useTranslation } from "react-i18next";
import { apiFetch } from "../../../utils/apiClient";


export default function EditMedicalReportModal({
  visible,
  onClose,
  report,
  onSaved,
}) {
  const { t } = useTranslation();

  const [fields, setFields] = useState({
    diagnosis: "",
    chronic_diseases: "",
    previous_surgeries: "",
    allergies: "",
    current_medications: "",
    treatment_plan: "",
  });

  useEffect(() => {
    if (report) {
      setFields({
        diagnosis: report.diagnosis || "",
        chronic_diseases: report.chronic_diseases || "",
        previous_surgeries: report.previous_surgeries || "",
        allergies: report.allergies || "",
        current_medications: report.current_medications || "",
        treatment_plan: report.treatment_plan || "",
      });
    }
  }, [report]);

  const updateReport = async () => {
    try {
   
      const response = await apiFetch(
        `api/patient/medical-record`,

        {
          method: "PUT",
         body: JSON.stringify(fields),
        },
      );

      const data = await response.json();

      console.log("Updated report:", data);

      if (response.ok) {
        onSaved();
      }
    } catch (error) {
      console.error("Update medical report error:", error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            {t("patientMedicalReport.editTitle")}
          </Text>

          {Object.keys(fields).map((key) => (
            <TextInput
              key={key}
              style={styles.input}
              value={fields[key]}
              placeholder={t(`patientMedicalReport.${key}`)}
              multiline
              onChangeText={(text) =>
                setFields({
                  ...fields,

                  [key]: text,
                })
              }
            />
          ))}

          <TouchableOpacity style={styles.save} onPress={updateReport}>
            <Text style={styles.saveText}>{t("common.save")}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>{t("common.cancel")}</Text>
          </TouchableOpacity>
        </View>
      </View>
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

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    minHeight: 45,
  },

  save: {
    backgroundColor: "#052443",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
  },

  cancel: {
    textAlign: "center",
    marginTop: 15,
  },
});
