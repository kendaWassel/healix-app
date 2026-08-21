import { useState, useCallback, useRef } from "react";
import { apiFetch } from "../../../utils/apiClient";

export function useDrugSuggestion() {
  const [suggestion, setSuggestion] = useState(null);
  const timeoutRef = useRef(null);

  const checkDrugName = useCallback((value, fieldKey) => {
    clearTimeout(timeoutRef.current);
    if (!value || value.trim().length < 3) {
      setSuggestion(null);
      return;
    }
 
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await apiFetch(
          `/api/ddi/resolve?name=${encodeURIComponent(value)}`
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