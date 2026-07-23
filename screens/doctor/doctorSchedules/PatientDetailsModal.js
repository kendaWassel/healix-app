import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function PatientDetailsModal({ details, onClose }) {
  const { t } = useTranslation();
  if (!details) return null;

  const chronicDiseases = details.medical_record?.chronic_diseases;
  const previousSurgeries = details.medical_record?.previous_surgeries;
  const allergies = details.medical_record?.allergies;
  const images = details.medical_record?.images || [];
  const files = details.medical_record?.files || [];
  const isPregnant = details.medical_record?.is_pregnant;

  const renderList = (value) => {
    if (!value) {
      return <Text style={styles.listItem}>• {t("patientDetailsModal.none")}</Text>;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <Text style={styles.listItem}>• {t("patientDetailsModal.none")}</Text>;
      }
      return value.map((item, index) => (
        <Text key={index} style={styles.listItem}>
          • {item}
        </Text>
      ));
    }

    return <Text style={styles.listItem}>• {value}</Text>;
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t("patientDetailsModal.title")}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 8 }}>
            <View style={styles.row}>
              <Text style={styles.label}>{t("patientDetailsModal.name")}</Text>
              <Text style={styles.value}>{details.patient_name || t("patientDetailsModal.notAvailable")}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t("patientDetailsModal.gender")}</Text>
              <Text style={styles.value}>{details.gender || t("patientDetailsModal.notAvailable")}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t("patientDetailsModal.birthDate")}</Text>
              <Text style={styles.value}>{details.birth_date || t("patientDetailsModal.notAvailable")}</Text>
            </View>

            {details.gender === "female" && (
              <View style={styles.row}>
                <Text style={styles.label}>{t("patientDetailsModal.pregnancyStatus")}</Text>
                <Text style={styles.value}>
                  {isPregnant === "yes"
                    ? t("patientDetailsModal.pregnant")
                    : isPregnant === "no"
                    ? t("patientDetailsModal.notPregnant")
                    : t("patientDetailsModal.notSpecified")}
                </Text>
              </View>
            )}
            <View style={styles.group}>
              <Text style={styles.label}>{t("patientDetailsModal.chronicDiseases")}</Text>
              {renderList(chronicDiseases)}
            </View>

            <View style={styles.group}>
              <Text style={styles.label}>{t("patientDetailsModal.previousSurgeries")}</Text>
              {renderList(previousSurgeries)}
            </View>

            <View style={styles.group}>
              <Text style={styles.label}>{t("patientDetailsModal.allergies")}</Text>
              {renderList(allergies)}
            </View>

            <View style={styles.group}>
              <Text style={styles.label}>{t("patientDetailsModal.attachments")}</Text>

              <Text style={styles.subLabel}>{t("patientDetailsModal.images")}</Text>
              {images.length > 0 ? (
                images.map((image) => (
                  <Image
                    key={image.id}
                    source={{
                      uri: image.file_url || undefined,
                    }}
                    defaultSource={require("../../../assets/no-photo.png")}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ))
              ) : (
                <Text style={styles.value}>{t("patientDetailsModal.noImages")}</Text>
              )}

              <Text style={[styles.subLabel, { marginTop: 12 }]}>{t("patientDetailsModal.files")}</Text>
              {files.length > 0 ? (
                files.map((file) => (
                  <View key={file.id} style={{ marginBottom: 6 }}>
                    {file.file_url ? (
                      <TouchableOpacity onPress={() => Linking.openURL(file.file_url)}>
                        <Text style={styles.fileLink}>
                          {file.file_name || file.file_url}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.value}>
                        {file.file_name || t("patientDetailsModal.file")} — {t("patientDetailsModal.linkUnavailable")}
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.value}>{t("patientDetailsModal.noFiles")}</Text>
              )}
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.footerButton}>
              <Text style={styles.footerButtonText}>{t("patientDetailsModal.close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(5,36,67,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 420,
    maxHeight: "85%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#052443",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 6,
  },
  label: {
    fontWeight: "700",
    color: "#374151",
  },
  value: {
    color: "#374151",
  },
  group: {
    marginTop: 12,
    marginBottom: 4,
  },
  listItem: {
    color: "#374151",
    marginLeft: 8,
    marginTop: 2,
  },
  subLabel: {
    fontWeight: "600",
    color: "#052443",
    marginTop: 6,
    marginBottom: 4,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f3f4f6",
  },
  fileLink: {
    color: "#2563eb",
    textDecorationLine: "underline",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    padding: 14,
  },
  footerButton: {
    backgroundColor: "#052443",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  footerButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});