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
import { CHRONIC_CONDITIONS } from "../../../constants/chronicConditions";

export default function PatientMedicalReport() {
  const { t, i18n } = useTranslation();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
 const [patientGender, setPatientGender] = useState(null); 

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
const fetchPatientGender = async () => {
    try {
      const response = await apiFetch(`/api/patient/profile`);
      const data = await response.json();
      if (response.ok) {
        setPatientGender(data.data?.gender || null);
      }
    } catch (error) {
      console.error("Failed to fetch patient gender:", error);
    }
  };
  useEffect(() => {
    fetchMedicalReport();
    fetchPatientGender();   
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  // Renders a list field (allergies, medications) as chips, handling both
  // the new array format and — defensively — any leftover legacy string
  // data, so old records don't break the screen.
  const renderChipList = (value) => {
    const list = Array.isArray(value)
      ? value
      : typeof value === "string" && value.trim()
      ? value.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    if (list.length === 0) {
      return <Text style={styles.value}>{t("common.none")}</Text>;
    }

    return (
      <View style={styles.chipsRow}>
        {list.map((item, index) => (
          <View key={index} style={styles.chip}>
            <Text style={styles.chipText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  };

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
            {t("patientMedicalReport.chronicDiseases")}
          </Text>
          {Array.isArray(report.chronic_diseases) && report.chronic_diseases.length > 0 ? (
            <View style={styles.chipsRow}>
              {report.chronic_diseases.map((value) => {
                const cond = CHRONIC_CONDITIONS.find((c) => c.value === value);
                const label = cond
                  ? (i18n.language?.startsWith("ar") ? cond.ar : cond.en)
                  : value;
                return (
                  <View key={value} style={styles.chip}>
                    <Text style={styles.chipText}>{label}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.value}>{t("common.none")}</Text>
          )}

          {(patientGender === "female" || patientGender === "أنثى") && (
            <>
              <Text style={styles.label}>
                {t("medicalReportModal.pregnancyStatus")}
              </Text>
              <Text style={styles.value}>
                {report.is_pregnant === "yes" || report.is_pregnant === true
                  ? t("medicalReportModal.pregnant")
                  : report.is_pregnant === "no" || report.is_pregnant === false
                  ? t("medicalReportModal.notPregnant")
                  : t("common.none")}
              </Text>
            </>
          )}

          <Text style={styles.label}>
            {t("medicalReportModal.otherConditions")}
          </Text>
          <Text style={styles.value}>
            {report.other_conditions || t("common.none")}
          </Text>

          <Text style={styles.label}>
            {t("patientMedicalReport.previousSurgeries")}
          </Text>
          <Text style={styles.value}>
            {report.previous_surgeries || t("common.none")}
          </Text>
  

          {/* Allergies — now stored as an array (one entry per drug), same
              chip rendering as chronic_diseases. */}
          <Text style={styles.label}>
            {t("patientMedicalReport.allergies")}
          </Text>
          {renderChipList(report.allergies)}

          {/* Current medications — same array format. */}
          <Text style={styles.label}>
            {t("patientMedicalReport.currentMedications")}
          </Text>
          {renderChipList(report.current_medications)}


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
          gender={patientGender}
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
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  chip: {
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
});