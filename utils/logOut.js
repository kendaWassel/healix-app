import * as SecureStore from "expo-secure-store";
import { apiFetch } from "./apiClient";



export async function performLogout(navigation) {
  try {


    await apiFetch(`/api/auth/logout`, {
      method: "POST"
    });
  } catch (err) {
    console.error("Logout request failed:", err);

  } finally {
   await SecureStore.deleteItemAsync("token");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }
}