import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import ForgotPasswordModal from "./ForgetPasswordModal";

export default function UserLogin() {
  const { t } = useTranslation();
  const [passwordShown, setPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);  

  const navigation = useNavigation();

  const handleSubmit = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || t("userLogin.loginFailed"));

      setSuccessMsg(t("userLogin.loginSuccess"));
      await AsyncStorage.setItem("token", data.token);

      if (data.email_verified) {
        const routes = {
          patient: "Patient", doctor: "Doctor", pharmacist: "Pharmacist",
          nurse: "Nurse", physiotherapist: "Physio",
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
        {/* الشعار في الأعلى بخلفية زرقاء */}
        <View style={styles.header}>
          <Text style={{ color: "#fff", fontSize: 36, fontWeight: "bold" }}>
            Heal<Text style={{ color: "#39CCCC" }}>ix</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>
            {t("userLogin.title")} <Text style={styles.titleCyan}>{t("userLogin.titleCyan")}</Text>
          </Text>
          <Text style={styles.subtitle}>{t("userLogin.subtitle")}</Text>

          {error && <Text style={styles.error}>{error}{t("userLogin.tryAgain")}</Text>}
          {successMsg && <Text style={styles.success}>{successMsg}</Text>}

          {/* الإيميل */}
          <View style={styles.inputGroup}>
            <Ionicons name="mail" size={22} color="#39CCCC" />
            <TextInput
              style={styles.input}
              placeholder={t("userLogin.emailPlaceholder")}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
            />
          </View>
          {/* كلمة المرور */}
          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed" size={22} color="#39CCCC" />
            <TextInput
              style={styles.input}
              placeholder={t("userLogin.passwordPlaceholder")}
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

          {/* زر الدخول */}
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

          {/* رابط التسجيل */}
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
    backgroundColor: "#052443",
    paddingVertical: 50,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logo: { width: 180, height: 120 },
  form: { padding: 28, marginTop: 120 },
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
  input: { flex: 1, fontSize: 16 },
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