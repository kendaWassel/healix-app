import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

const API = "https://unjuicy-schizogenous-gibson.ngrok-free.dev";

export const uploadImage = async (photoFile) => {
  const formData = new FormData();
  formData.append("image", {
    uri: photoFile.uri, name: "photo.jpg", type: "image/jpeg",
  });
  formData.append("category", "report");
  const res = await fetch(`${API}/api/uploads/image`, {
    method: "POST",
    headers: { "ngrok-skip-browser-warning": "true" },
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
  const res = await fetch(`${API}/api/uploads`, {
    method: "POST",
    headers: { "ngrok-skip-browser-warning": "true" },
    body: formData,
  });
  if (!res.ok) throw new Error("File upload failed");
  return (await res.json()).file_id;
};

export default function MedicalReportModal({ open, onClose, onSubmit, initialValues }) {
  const [fields, setFields] = useState({
    diagnosis: "", chronic_diseases: "", previous_surgeries: "",
    allergies: "", current_medications: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [medicalFile, setMedicalFile] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (open && initialValues) {
      setFields({
        diagnosis: initialValues.diagnosis || "",
        chronic_diseases: initialValues.chronic_diseases || "",
        previous_surgeries: initialValues.previous_surgeries || "",
        allergies: initialValues.allergies || "",
        current_medications: initialValues.current_medications || "",
      });
    } else if (open) {
      setFields({
        diagnosis: "", chronic_diseases: "", previous_surgeries: "",
        allergies: "", current_medications: "",
      });
      setPhotoFile(null);
      setMedicalFile(null);
    }
  }, [open, initialValues]);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoFile(result.assets[0]);
      setPhotoName(result.assets[0].fileName || "photo selected");
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      setMedicalFile(result.assets[0]);
      setFileName(result.assets[0].name);
    }
  };

  const handleSubmit = async () => {
    await onSubmit({ ...fields, photoFile, medicalFile });
  };

  return (
    <Modal visible={open} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalWrap}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Medical Report</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            <Text style={styles.label}>Diagnosis</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter diagnosis..."
              value={fields.diagnosis}
              onChangeText={(t) => setFields({ ...fields, diagnosis: t })}
            />

            <TouchableOpacity style={styles.fileBtn} onPress={pickPhoto}>
              <Ionicons name="image" size={18} color="#333" />
              <Text style={styles.fileBtnText}>
                {photoName || "Medical Photos"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.fileBtn} onPress={pickDocument}>
              <Ionicons name="document-text" size={18} color="#333" />
              <Text style={styles.fileBtnText}>
                {fileName || "Medical Files"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Chronic Diseases</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter any chronic diseases..."
              value={fields.chronic_diseases}
              onChangeText={(t) => setFields({ ...fields, chronic_diseases: t })}
            />

            <Text style={styles.label}>Previous Surgeries</Text>
            <TextInput
              style={styles.input}
              placeholder="Previous surgeries..."
              value={fields.previous_surgeries}
              onChangeText={(t) => setFields({ ...fields, previous_surgeries: t })}
            />

            <Text style={styles.label}>Allergies</Text>
            <TextInput
              style={styles.input}
              placeholder="Known allergies..."
              value={fields.allergies}
              onChangeText={(t) => setFields({ ...fields, allergies: t })}
            />

            <Text style={styles.label}>Current Medications</Text>
            <TextInput
              style={styles.input}
              placeholder="List current medications..."
              value={fields.current_medications}
              onChangeText={(t) => setFields({ ...fields, current_medications: t })}
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
              <Text style={styles.saveBtnText}>Save Report</Text>
            </TouchableOpacity>
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
  fileBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    padding: 12, marginTop: 12,
  },
  fileBtnText: { color: "#666", fontSize: 14 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: "#eee" },
  saveBtn: {
    backgroundColor: "#2563eb", padding: 14, borderRadius: 8, alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700" },
});