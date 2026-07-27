import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { BASE_URL, NGROK_HEADERS } from "../../../constants/api";

export function useLabAnalysis() {
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supportedTests, setSupportedTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);

  const fetchSupportedTests = async () => {
    setLoadingTests(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/lab/supported-tests`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          ...NGROK_HEADERS,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load supported tests");
      }

      const data = await res.json();
      console.log("test: ", data);
      setSupportedTests(data.data || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTests(false);
    }
  };

  const analyze = async (extraData = {}) => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      });

      Object.entries(extraData).forEach(([k, v]) => {
        if (v) formData.append(k, v);
      });

      const res = await fetch(`${BASE_URL}/lab/analyze`, {
        method: "POST",
        headers: {
          ...NGROK_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      console.log("analyze: ", data);
      setReport(data.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    file,
    setFile,
    report,
    loading,
    error,
    analyze,
    loadingTests,
    supportedTests,
    fetchSupportedTests,
  };
}
