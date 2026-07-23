import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../i18n/i18n"

const BASE_URL = "https://unjuicy-schizogenous-gibson.ngrok-free.dev";

export async function apiFetch(endpoint, options = {}) {
  const token = await AsyncStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    "Accept-Language": i18n.language,  
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}