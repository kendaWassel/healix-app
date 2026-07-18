// hooks/useDrugSuggestion.js
import { useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DDI_URL = "https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/ddi";

export function useDrugSuggestion() {
  const [suggestion, setSuggestion] = useState(null);
  const timeoutRef = useRef(null);

  const checkDrugName = useCallback((value, fieldKey) => {
    clearTimeout(timeoutRef.current);

    if (!value || value.trim().length < 3) {
      setSuggestion(null);
      return;
    }

    // wait 600ms after finishing write
    timeoutRef.current = setTimeout(async () => {
      try {
        const token = await AsyncStorage.getItem("token");   // 👈 await مضاف
        const res = await fetch(
          `${DDI_URL}/resolve?name=${encodeURIComponent(value)}`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        const result = data.data || data;

        if (result.resolved === false && result.suggestion) {
          setSuggestion({
            field: fieldKey,
            value: result.suggestion,
            score: result.suggestion_score,
          });
        } else {
          setSuggestion(null);
        }
      } catch (err) {
        console.error("Resolve check failed:", err);
      }
    }, 600);
  }, []);

  const clearSuggestion = () => setSuggestion(null);

  return { suggestion, checkDrugName, clearSuggestion };
}