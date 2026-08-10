import { useEffect } from "react";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL, NGROK_HEADERS } from "../../../constants/api";

const UPDATE_INTERVAL_MS = 10000; // send location every 10s

export default function useLiveLocationTracking(activeTaskIds = []) {
  // stable string key so the effect only restarts when the actual set of ids changes
  const taskIdsKey = activeTaskIds.slice().sort().join(",");

  useEffect(() => {
    if (activeTaskIds.length === 0) return;

    let intervalId = null;
    let cancelled = false;

    const sendLocation = async () => {
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = position.coords;
        const token = await AsyncStorage.getItem("token");

        for (const taskId of activeTaskIds) {
          fetch(`${BASE_URL}/delivery/location/update`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...NGROK_HEADERS,
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ task_id: taskId, latitude, longitude }),
          })
            .then((res) => res.json())
            .then((data) =>
              console.log(`Location updated for task ${taskId}:`, data)
            )
            .catch((err) =>
              console.error(`Location update failed for task ${taskId}:`, err)
            );
        }
      } catch (err) {
        console.error("Error getting current location:", err);
      }
    };

    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission not granted, live tracking disabled");
        return;
      }
      if (cancelled) return;

      sendLocation(); // fire immediately, then repeat
      intervalId = setInterval(sendLocation, UPDATE_INTERVAL_MS);
    };

    start();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [taskIdsKey]);
}