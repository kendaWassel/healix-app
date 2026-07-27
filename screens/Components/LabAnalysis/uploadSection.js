import * as DocumentPicker from "expo-document-picker";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { colors } from "../../../constants/colors";

const ACCEPTED_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/pdf",
];

export default function UploadSection({ file, setFile, onAnalyze, loading }) {
  const { t } = useTranslation();

  const triggerFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ACCEPTED_TYPES,
      });
      if (result.canceled) return;
      setFile(result.assets[0]);
    } catch (err) {
      console.error("Error picking lab report file:", err);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("labAnalysis.uploadTitle")}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.uploadBtn} onPress={triggerFileUpload}>
          <Text style={styles.uploadBtnText}>{t("labAnalysis.uploadFile")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.analyzeBtn,
            (!file || loading) && styles.analyzeBtnDisabled,
          ]}
          onPress={() => onAnalyze()}
          disabled={!file || loading}
        >
          <Text style={styles.analyzeBtnText}>
            {loading ? t("labAnalysis.analyzing") : t("labAnalysis.analyzeReport")}
          </Text>
        </TouchableOpacity>
      </View>

      {file && (
        <Text style={styles.selectedFileText}>
          {t("labAnalysis.selectedFile")}{" "}
          <Text style={styles.selectedFileName}>{file.name}</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 16,
    padding: 18,
    backgroundColor: colors.white,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#0a3460", marginBottom: 14 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  uploadBtn: {
    backgroundColor: colors.cyan,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  uploadBtnText: { color: colors.white, fontWeight: "600" },
  analyzeBtn: {
    backgroundColor: colors.darkBlue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  analyzeBtnDisabled: { opacity: 0.5 },
  analyzeBtnText: { color: colors.white, fontWeight: "600" },
  selectedFileText: { marginTop: 12, fontSize: 13, color: colors.gray700 },
  selectedFileName: { fontWeight: "600" },
});
