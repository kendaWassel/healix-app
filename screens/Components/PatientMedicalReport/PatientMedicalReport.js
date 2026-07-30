import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { useTranslation } from "react-i18next";
import EditMedicalReportModal from "./EditMedicalReportModal";
import { apiFetch } from "../../../utils/apiClient";



export default function PatientMedicalReport() {
  const { t } = useTranslation();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const fetchMedicalReport = async () => {
    try {
      setLoading(true);



      const response = await apiFetch(`/api/patient/medical-record`);

      const data = await response.json();

      console.log("Medical report:", data);

      if (response.ok) {
        setReport(data.data);
      }
    } catch (error) {
      console.error("Medical report loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalReport();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("patientMedicalReport.title")}</Text>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setEditOpen(true)}
        >
          <Text style={styles.editText}>{t("common.edit")}</Text>
        </TouchableOpacity>
      </View>

      {report ? (
        <>
          <Text style={styles.label}>
            {t("patientMedicalReport.diagnosis")}
          </Text>

          <Text style={styles.value}>
            {report.diagnosis || t("common.none")}
          </Text>

          <Text style={styles.label}>
            {t("patientMedicalReport.chronicDiseases")}
          </Text>

          <Text style={styles.value}>
            {report.chronic_diseases || t("common.none")}
          </Text>

          <Text style={styles.label}>
            {t("patientMedicalReport.previousSurgeries")}
          </Text>

          <Text style={styles.value}>
            {report.previous_surgeries || t("common.none")}
          </Text>

          <Text style={styles.label}>
            {t("patientMedicalReport.allergies")}
          </Text>

          <Text style={styles.value}>
            {report.allergies || t("common.none")}
          </Text>

          <Text style={styles.label}>
            {t("patientMedicalReport.currentMedications")}
          </Text>

          <Text style={styles.value}>
            {report.current_medications || t("common.none")}
          </Text>

          <Text style={styles.label}>
            {t("patientMedicalReport.treatmentPlan")}
          </Text>

          <Text style={styles.value}>
            {report.treatment_plan || t("common.none")}
          </Text>
        </>
      ) : (
        <Text>{t("patientMedicalReport.noReport")}</Text>
      )}

      <EditMedicalReportModal
        visible={editOpen}
        onClose={() => {
          setEditOpen(false);
        }}
        report={report}
        onSaved={() => {
          setEditOpen(false);
          fetchMedicalReport();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 18,
    marginTop: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#052443",
  },

  editBtn: {
    backgroundColor: "#052443",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },

  editText: {
    color: "#fff",
    fontWeight: "600",
  },

  label: {
    marginTop: 12,
    fontWeight: "700",
    color: "#374151",
  },

  value: {
    marginTop: 4,
    color: "#555",
  },
});
