import { useState } from "react";
import { apiFetch } from "../../../utils/apiClient";




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


      const res = await apiFetch(`/api/lab/supported-tests`);

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
    console.log('called')
    if (!file) {
    console.log('no file')
      
      return
    };

    setLoading(true);
    setError(null);

    try {
      

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      });

      Object.entries(extraData).forEach(([k, v]) => {
        if (v) formData.append(k, v);
      });

      const res = await apiFetch(`/api/lab/analyze`, {
        method: "POST",
        body: formData,
      });

const text = await res.text();

console.log("STATUS:", res.status);
console.log("SERVER RESPONSE:", text);

let data;

try {
  data = JSON.parse(text);
} catch {
  throw new Error(text || "Analysis failed");
}

if (!res.ok) {
  throw new Error(
    data?.message ||
    data?.error ||
    data?.errors?.file?.[0] ||
    "Analysis failed"
  );
}

console.log("analyze:", data);
setReport(data?.data);
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
