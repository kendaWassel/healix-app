import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL, NGROK_HEADERS } from "../../../constants/api";

const ACTIVE_INTERVAL_MS = 10000;      // 10s while on an active task
const IDLE_INTERVAL_MS = 5 * 60 * 1000; // 5 min while idle

export default function useLiveLocationTracking(activeTaskIds = []) {
  const taskIdsKey = activeTaskIds.slice().sort().join(",");
  const hasActiveTask = activeTaskIds.length > 0;

  useEffect(() => {
    let intervalId = null;
    let cancelled = false;

    const sendLocation = async () => {
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = position.coords;
        const token = await AsyncStorage.getItem("token");

        if (hasActiveTask) {
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
        } else {
          fetch(`${BASE_URL}/delivery/location/update`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...NGROK_HEADERS,
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ latitude, longitude }),
          })
            .then((res) => res.json())
            .then((data) => console.log("Idle location updated:", data))
            .catch((err) => console.error("Idle location update failed:", err));
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

      sendLocation();
      const interval = hasActiveTask ? ACTIVE_INTERVAL_MS : IDLE_INTERVAL_MS;
      intervalId = setInterval(sendLocation, interval);
    };

    start();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [taskIdsKey, hasActiveTask]);
}