import { useState } from "react";
import UploadSection from "../../../Components/LabAnalysis/uploadSection";
import { View, Text ,TouchableOpacity,ActivityIndicator,StyleSheet} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { BASE_URL, NGROK_HEADERS } from "../../../../constants/api";
import { colors } from "../../../../constants/colors";

import { useLabAnalysis } from "../../../Components/LabAnalysis/useLabAnalysis";

export default function LabUploadHandler({ onFinished }) {
  const { file, setFile, report, analyze, loading ,error} = useLabAnalysis();

  const [started, setStarted] = useState(false);
    const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const { t } = useTranslation();

  const handleAnalyze = async () => {
    setStarted(true);

    await analyze();

  };
const handleDownload = async () => {
  if (!report?.patient_pdf_url) {
    setDownloadError(t("labAnalysis.downloadFail"));
    return;
  }

  setDownloading(true);
  setDownloadError(null);

  try {
    const token = await AsyncStorage.getItem("token");

    const response = await fetch(report.patient_pdf_url, {
      method: "GET",
      headers: {
        ...NGROK_HEADERS,
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("PDF download status:", response.status);
    console.log("PDF download content-type:", response.headers.get("content-type"));

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.log("PDF download error body:", errText);
      throw new Error(`Download failed: ${response.status}`);
    }

    const blob = await response.blob();
    console.log("Blob size:", blob.size, "Blob type:", blob.type);

    const fileUri = `${FileSystem.documentDirectory}lab-report-${report.id}.pdf`;

    const reader = new FileReader();
    const base64Data = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: t("labAnalysis.downloadReport"),
      });
    }
  } catch (err) {
    console.error("Error downloading PDF report:", err);
    setDownloadError(err.message || t("labAnalysis.downloadFail"));
  } finally {
    setDownloading(false);
  }
};

  return (
    <View>
      <UploadSection
        file={file}
        setFile={setFile}
        loading={loading}
        onAnalyze={handleAnalyze}
      />
      {loading && <Text>{t("labAnalysis.waitingMessage")}</Text>}
{error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
      {started && !loading && report && (
        <View style={styles.resultActions}>
          <TouchableOpacity
            style={[styles.downloadBtn, downloading && styles.btnDisabled]}
            onPress={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.downloadBtnText}>
                {t("labAnalysis.downloadPdf")}
              </Text>
            )}
          </TouchableOpacity>

          {downloadError && (
            <Text style={styles.errorText}>{downloadError}</Text>
          )}


          <TouchableOpacity style={styles.continueBtn} onPress={onFinished}>
            <Text style={styles.continueBtnText}>{t("common.continue")}</Text>
          </TouchableOpacity>
        </View>
      )}
          <TouchableOpacity style={styles.cancelBtn} onPress={onFinished}>
            <Text style={styles.cancelBtnText}>{t("common.cancel")}</Text>
          </TouchableOpacity>

    </View>
  );
}
const styles = StyleSheet.create({
  resultActions: {
    marginTop: 16,
    gap: 12,
  },
  downloadBtn: {
    backgroundColor: colors.darkBlue,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  downloadBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  continueBtn: {
    backgroundColor: colors.white,
      paddingVertical: 12,
  paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    borderWidth:2,
    borderColor: colors.cardBorder
  },
  continueBtnText: {
    color: colors.darkBlue,
    fontWeight: "600",
  },
cancelBtn: {
  backgroundColor: colors.danger,
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
  alignSelf: "flex-start",
  marginTop:16
},
  cancelBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    textAlign: "center",
  },
});
