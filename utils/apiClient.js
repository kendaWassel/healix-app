import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../i18n/i18n";
import { Platform } from "react-native";
const BASE_URL = "https://healix-backend-production.up.railway.app";

export async function apiFetch(endpoint, options = {}) {
  const token = await AsyncStorage.getItem("token");

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = {
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    "Accept-Language": i18n.language,

    ...(isFormData
      ? {}
      : { "Content-Type": "application/json" }),

    ...(token && {
      Authorization: `Bearer ${token}`,
    }),

    ...options.headers,
  };

  const { timeoutMs, ...restOptions } = options;

  let signal = restOptions.signal;
  let timer;

  if (timeoutMs && !signal) {
    const controller = new AbortController();

    signal = controller.signal;

    timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);
  }

  console.log("========== API REQUEST ==========");
  console.log("URL:", `${BASE_URL}${endpoint}`);
  console.log("METHOD:", restOptions.method || "GET");
  console.log("IS FORMDATA:", isFormData);
  console.log("=================================");

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...restOptions,
      headers,
      signal,
    });

    console.log("API RESPONSE:", response.status, endpoint);

    return response;
  } catch (error) {
    console.error("❌ API FETCH ERROR:", endpoint);
    console.error(error);

    throw error;
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}