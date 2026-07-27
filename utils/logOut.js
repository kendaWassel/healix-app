// utils/logout.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "https://unjuicy-schizogenous-gibson.ngrok-free.dev";

export async function performLogout(navigation) {
  try {
    const token = await AsyncStorage.getItem("token");

    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
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