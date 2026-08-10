import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../../../utils/apiClient";

const POLL_INTERVAL_MS = 10000;

export default function useTrackDeliveryLocation(taskId) {
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchLocation = async () => {
    try {
      const response = await apiFetch(
        `/api/patient/delivery/location/${taskId}`
      );

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || "Failed to fetch location");
      }

      const data = await response.json();
      if (data.status === "success" && data.data) {
        setLocation(data.data);
        setError(null);
      }
    } catch (err) {
      console.error("Track delivery location error:", err);
      setError(err.message || "Failed to fetch location");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!taskId) return;

    fetchLocation(); // fire immediately
    intervalRef.current = setInterval(fetchLocation, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [taskId]);

  return { location, isLoading, error };
}