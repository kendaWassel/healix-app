import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL, NGROK_HEADERS } from "../../../constants/api";
import { getCurrentCoords } from "../../../utils/getCurrentCoords";

const UPDATE_INTERVAL_MS = 60 * 1000;

export default function useProviderLocationTracking(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    let intervalId = null;
    let cancelled = false;

    const sendLocation = async () => {
      try {
        const { latitude, longitude } = await getCurrentCoords();
        const token = await AsyncStorage.getItem("token");

        fetch(`${BASE_URL}/provider/location/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ latitude, longitude }),
        })
          .then((res) => res.json())
          .then((data) => console.log("Provider location updated:", data))
          .catch((err) =>
            console.error("Provider location update failed:", err)
          );
      } catch (err) {
        console.error("Error getting current location:", err);
      }
    };

    const start = async () => {
      if (cancelled) return;
      sendLocation(); // fire immediately
      intervalId = setInterval(sendLocation, UPDATE_INTERVAL_MS);
    };

    start();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [enabled]);
}