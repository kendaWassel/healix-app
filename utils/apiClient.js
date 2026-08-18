import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../i18n/i18n";

const BASE_URL = "https://unjuicy-schizogenous-gibson.ngrok-free.dev";

export async function apiFetch(endpoint, options = {}) {
  const token = await AsyncStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const headers = {
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    "Accept-Language": i18n.language,
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const { timeoutMs, ...restOptions } = options;
  let signal = restOptions.signal;
  let timer;

  if (timeoutMs && !signal) {
    const controller = new AbortController();
    signal = controller.signal;
    timer = setTimeout(() => controller.abort(), timeoutMs);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...restOptions,
      headers,
      signal,
    });
    return response;
  } finally {
    if (timer) clearTimeout(timer);
  }
}