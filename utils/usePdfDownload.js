import { useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { apiFetch } from "./apiClient";

export function usePdfDownload() {
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  const downloadFromUrl = async (pdfUrl, fileId, dialogTitle) => {
    if (!pdfUrl) {
      setDownloadError("MISSING_URL");
      return;
    }

    setDownloadingId(fileId);
    setDownloadError(null);

    try {
      // apiFetch expects a relative API path.
      // If the backend sends a full URL, extract only the path.
      let apiPath = pdfUrl;

      if (pdfUrl.startsWith("http")) {
        const parsedUrl = new URL(pdfUrl);
        apiPath = parsedUrl.pathname + parsedUrl.search;
      }

      console.log("PDF API path:", apiPath);

      const response = await apiFetch(apiPath);

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        console.log("PDF download error body:", errText);
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();

      const fileUri =
        `${FileSystem.documentDirectory}lab-report-${fileId}.pdf`;

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
          dialogTitle,
        });
      }
    } catch (err) {
      console.error("Error downloading PDF report:", err);
      setDownloadError(err.message || "DOWNLOAD_FAILED");
    } finally {
      setDownloadingId(null);
    }
  };

  // Patient side
  const downloadPdf = (pdfUrl, fileId, dialogTitle) =>
    downloadFromUrl(pdfUrl, fileId, dialogTitle);

  // Doctor side
  const downloadDoctorPdf = (patientId, analysisId, dialogTitle) => {
    const url =
      `/api/patients/${patientId}/lab/analyses/${analysisId}/pdf`;

    return downloadFromUrl(url, analysisId, dialogTitle);
  };

  return {
    downloadPdf,
    downloadDoctorPdf,
    downloadingId,
    downloadError,
  };
}