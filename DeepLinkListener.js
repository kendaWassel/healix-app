import { useEffect } from "react";
import * as Linking from "expo-linking";
import { useNavigation } from "@react-navigation/native";

export default function DeepLinkListener() {
  const navigation = useNavigation();

  useEffect(() => {
    const handleDeepLink = (event) => {
      if (!event?.url) return;
      const { path, hostname, queryParams } = Linking.parse(event.url);
    
      const cleanPath = (path || hostname || "").replace(/^\//, "");
      const token = Array.isArray(queryParams?.token)
        ? queryParams.token[0]
        : queryParams?.token;
      const role = Array.isArray(queryParams?.role)
        ? queryParams.role[0]
        : queryParams?.role;
      if (cleanPath === "verify-email" && token) {
        navigation.navigate("VerifyEmailScreen", { token, role });
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, []);

  return null;
}