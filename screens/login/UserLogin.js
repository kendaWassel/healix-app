import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import ForgotPasswordModal from "./ForgetPasswordModal";
import { apiFetch } from "../../utils/apiClient";
import { useTrackedNavigation } from "../../hooks/useTrackedNavigation";

export default function UserLogin() {
  const { t } = useTranslation();
  const [passwordShown, setPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigation = useTrackedNavigation();

  const handleSubmit = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const response = await apiFetch(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || t("userLogin.loginFailed"));

   
      if (data.role === "admin") {
        setIsLoading(false);
        Alert.alert(
          t("userLogin.adminNotSupportedTitle"),
          t("userLogin.adminNotSupportedMessage")
        );
        return;
      }

      setSuccessMsg(t("userLogin.loginSuccess"));
      await SecureStore.setItemAsync("token", data.token);
      if (data.email_verified) {
        const routes = {
          patient: "Patient",
          doctor: "Doctor",
          pharmacist: "Pharmacist",
          nurse: "Nurse",
          physiotherapist: "Physio",
        };
        navigation.navigate(routes[data.role] || "Delivery");
      }
    } catch (err) {
      setError(err.message || t("userLogin.loginFailedRetry"));
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = email.length < 10 || password.length < 6 || isLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
       <LinearGradient
          colors={["#052443", "#0a3a6b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Image
            source={require("../../assets/Logo-light.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </LinearGradient>
        <View style={styles.form}>
          <Text style={styles.title}>
            {t("userLogin.title")} <Text style={styles.titleCyan}>{t("userLogin.titleCyan")}</Text>
          </Text>
          <Text style={styles.subtitle}>{t("userLogin.subtitle")}</Text>
          {error && <Text style={styles.error}>{error}{t("userLogin.tryAgain")}</Text>}
          {successMsg && <Text style={styles.success}>{successMsg}</Text>}

          <View style={styles.inputGroup}>
            <Ionicons name="mail" size={22} color="#39CCCC" />
            <TextInput
              style={styles.input}
              placeholder={t("userLogin.emailPlaceholder")}
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed" size={22} color="#39CCCC" />
            <TextInput
              style={styles.input}
              placeholder={t("userLogin.passwordPlaceholder")}
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!passwordShown}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
            <TouchableOpacity onPress={() => setPasswordShown(!passwordShown)}>
              <Ionicons
                name={passwordShown ? "eye" : "eye-off"}
                size={22}
                color="#767676"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setShowForgotPassword(true)}
            style={{ alignSelf: "flex-end", marginTop: 4 }}
          >
            <Text style={styles.forgotPasswordLink}>{t("forgotPassword.linkText")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isDisabled}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t("userLogin.signIn")}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>{t("userLogin.noAccount")}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>{t("userLogin.register")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { flexGrow: 1 },
  header: {
    paddingVertical: 45,
    alignItems: "center",
    justifyContent: "center",
      borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    shadowColor: "#052443",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
      elevation: 8,
  
  },
  logo: { width: 180, height: 120 },
  form: { padding: 28, marginTop: 60 },
  title: {
    fontSize: 26, fontWeight: "bold", color: "#052443", textAlign: "center",
  },
  titleCyan: { color: "#39CCCC" },
  subtitle: {
    fontSize: 16, color: "#767676", textAlign: "center", marginVertical: 14,
  },
  error: { color: "red", textAlign: "center", marginBottom: 8 },
  success: { color: "green", textAlign: "center", marginBottom: 8 },
  inputGroup: {
    flexDirection: "row", alignItems: "center", borderWidth: 1,
    borderColor: "#e0e0e0", borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, marginVertical: 10, gap: 10,
  },
  input: { flex: 1, fontSize: 16 , color: "#052443"},
  button: {
    backgroundColor: "#052443", padding: 16, borderRadius: 10,
    alignItems: "center", marginTop: 20,
  },
  buttonDisabled: { backgroundColor: "#9ca3af" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  registerRow: {
    flexDirection: "row", justifyContent: "center", marginTop: 20,
  },
  registerText: { color: "#767676" },
  registerLink: { color: "#39CCCC", fontWeight: "600" },
  forgotPasswordLink: {
    color: "#39CCCC",
    fontWeight: "600",
    fontSize: 13,
  },
});