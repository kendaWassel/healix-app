import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [countdown, setCountdown] = useState(3);


  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark-circle" size={72} color="#16a34a" />
      </View>
      <Text style={styles.title}>{t("verifyEmail.title")}</Text>
      <Text style={styles.subtitle}>{t("verifyEmail.subtitle")}</Text>
      <Text style={styles.countdown}>
        {t("verifyEmail.redirecting", { seconds: countdown })}
      </Text>
      <TouchableOpacity
        onPress={() => navigation.reset({ index: 0, routes: [{ name: "Login" }] })}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{t("verifyEmail.goToLoginNow")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#052443",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  countdown: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#052443",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});