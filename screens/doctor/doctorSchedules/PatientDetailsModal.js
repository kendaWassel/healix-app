// screens/doctorSchedules/PatientDetailsModal.js
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

export default function PatientDetailsModal({ details, onClose }) {
  if (!details) return null;

  const chronicDiseases = details.medical_record?.chronic_diseases || [];
  const previousSurgeries = details.medical_record?.previous_surgeries || [];
  const allergies = details.medical_record?.allergies || [];
  const images = details.medical_record?.images || [];
  const files = details.medical_record?.files || [];

  const renderList = (items) => {
    if (items.length === 0) {
      return <Text style={styles.listItem}>• None</Text>;
    }
    return items.map((item, index) => (
      <Text key={index} style={styles.listItem}>
        • {item}
      </Text>
    ));
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Patient Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 8 }}>
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{details.patient_name || "N/A"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Gender:</Text>
              <Text style={styles.value}>{details.gender || "N/A"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Birth Date:</Text>
              <Text style={styles.value}>{details.birth_date || "N/A"}</Text>
            </View>

            <View style={styles.group}>
              <Text style={styles.label}>Chronic Diseases:</Text>
              {renderList(chronicDiseases)}
            </View>

            <View style={styles.group}>
              <Text style={styles.label}>Previous Surgeries:</Text>
              {renderList(previousSurgeries)}
            </View>

            <View style={styles.group}>
              <Text style={styles.label}>Allergies:</Text>
              {renderList(allergies)}
            </View>

            <View style={styles.group}>
              <Text style={styles.label}>Attachments:</Text>

              <Text style={styles.subLabel}>Images:</Text>
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
                <Text style={styles.value}>No images</Text>
              )}

              <Text style={[styles.subLabel, { marginTop: 12 }]}>Files:</Text>
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
                        {file.file_name || "File"} — link is not available!
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.value}>No files</Text>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.footerButton}>
              <Text style={styles.footerButtonText}>Close</Text>
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