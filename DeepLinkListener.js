import { useEffect } from "react";
import * as Linking from "expo-linking";
import { useNavigation } from "@react-navigation/native";

export default function DeepLinkListener() {
  const navigation = useNavigation();

  useEffect(() => {
    const handleDeepLink = (event) => {
      const { path } = Linking.parse(event.url);
      if (path === "verify-email") {
        navigation.navigate("VerifyEmailScreen");
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