import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useNavigation, useRoute } from "@react-navigation/native";


export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const [status, setStatus] = useState("loading"); 

 useEffect(() => {
  const finalizeVerification = async () => {
    const { token, role } = route.params || {};
    if (!token) {
      setStatus("error");
      return;
    }
    await AsyncStorage.setItem("token", token);
    setStatus("success");
    setTimeout(() => {
      const routes = {
        patient: "Patient",
        doctor: "Doctor",
        pharmacist: "Pharmacist",
        nurse: "Nurse",
        physiotherapist: "Physio",
        delivery: "Delivery",
      };
      navigation.reset({
        index: 0,
        routes: [{ name: routes[role] || "Login" }],
      });
    }, 1500);
  };
  finalizeVerification();
}, []);
  return (
    <View style={styles.container}>
      {status === "loading" && (
        <>
          <ActivityIndicator size="large" color="#39CCCC" />
          <Text style={styles.subtitle}>{t("verifyEmail.verifying")}</Text>
        </>
      )}
      {status === "success" && (
        <>
          <Ionicons name="checkmark-circle" size={72} color="#16a34a" />
          <Text style={styles.title}>{t("verifyEmail.title")}</Text>
          <Text style={styles.subtitle}>{t("verifyEmail.subtitle")}</Text>
        </>
      )}
      {status === "error" && (
        <>
          <Ionicons name="alert-circle" size={72} color="#dc2626" />
          <Text style={styles.title}>{t("verifyEmail.errorTitle")}</Text>
          <Text style={styles.subtitle}>{t("verifyEmail.errorSubtitle")}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", padding: 32 },
  title: { fontSize: 22, fontWeight: "700", color: "#052443", textAlign: "center", marginTop: 20, marginBottom: 10 },
  subtitle: { fontSize: 15, color: "#6b7280", textAlign: "center", lineHeight: 22 },
});