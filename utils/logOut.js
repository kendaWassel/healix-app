// utils/logout.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./apiClient";



export async function performLogout(navigation) {
  try {


    await apiFetch(`/api/auth/logout`, {
      method: "POST"
    });
  } catch (err) {
    console.error("Logout request failed:", err);

  } finally {
    await AsyncStorage.removeItem("token");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }
}