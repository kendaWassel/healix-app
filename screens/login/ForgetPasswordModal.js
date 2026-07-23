// screens/login/ForgetPasswordModal.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const API_BASE = "https://unjuicy-schizogenous-gibson.ngrok-free.dev";

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordShown, setPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail("");
      setOtp("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
    }
  }, [isOpen]);

  const commonHeaders = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    "Accept-Language": i18n.language,
  };


  const handleSendCode = async () => {
    if (!email.trim()) {
      setError(t("forgotPassword.emailRequired"));
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: commonHeaders,
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || t("forgotPassword.sendCodeFailed"));
      }

      setStep(2);
    } catch (err) {
      setError(err.message || t("forgotPassword.sendCodeFailed"));
    } finally {
      setIsLoading(false);
    }
  };


  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError(t("forgotPassword.codeRequired"));
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-reset-otp`, {
        method: "POST",
        headers: commonHeaders,
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || t("forgotPassword.invalidCode"));
      }

      setResetToken(data.data.reset_token);
      setStep(3);
    } catch (err) {
      setError(err.message || t("forgotPassword.invalidCode"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      setError(t("forgotPassword.passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("forgotPassword.passwordsDontMatch"));
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: commonHeaders,
        body: JSON.stringify({
          email,
          reset_token: resetToken,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || t("forgotPassword.resetFailed"));
      }

      setStep(4);
    } catch (err) {
      setError(err.message || t("forgotPassword.resetFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {step !== 4 && (
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          )}

          {/* Step 1 — Email */}
          {step === 1 && (
            <>
              <Text style={styles.title}>{t("forgotPassword.step1Title")}</Text>
              <Text style={styles.subtitle}>{t("forgotPassword.step1Subtitle")}</Text>

              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.inputGroup}>
                <Ionicons name="mail" size={20} color="#39CCCC" />
                <TextInput
                  style={styles.input}
                  placeholder={t("forgotPassword.emailPlaceholder")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
                onPress={handleSendCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>{t("forgotPassword.sendCode")}</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <>
              <Text style={styles.title}>{t("forgotPassword.step2Title")}</Text>
              <Text style={styles.subtitle}>
                {t("forgotPassword.step2Subtitle", { email })}
              </Text>

              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.inputGroup}>
                <Ionicons name="key" size={20} color="#39CCCC" />
                <TextInput
                  style={styles.input}
                  placeholder={t("forgotPassword.codePlaceholder")}
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={setOtp}
                  editable={!isLoading}
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>{t("forgotPassword.verifyCode")}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSendCode} disabled={isLoading} style={{ marginTop: 12 }}>
                <Text style={styles.linkText}>{t("forgotPassword.resendCode")}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 3 — New Password */}
          {step === 3 && (
            <>
              <Text style={styles.title}>{t("forgotPassword.step3Title")}</Text>
              <Text style={styles.subtitle}>{t("forgotPassword.step3Subtitle")}</Text>

              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.inputGroup}>
                <Ionicons name="lock-closed" size={20} color="#39CCCC" />
                <TextInput
                  style={styles.input}
                  placeholder={t("forgotPassword.newPasswordPlaceholder")}
                  secureTextEntry={!passwordShown}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setPasswordShown(!passwordShown)}>
                  <Ionicons name={passwordShown ? "eye" : "eye-off"} size={20} color="#767676" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Ionicons name="lock-closed" size={20} color="#39CCCC" />
                <TextInput
                  style={styles.input}
                  placeholder={t("forgotPassword.confirmPasswordPlaceholder")}
                  secureTextEntry={!passwordShown}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>{t("forgotPassword.resetPassword")}</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Step 4 — Success */}
          {step === 4 && (
            <View style={{ alignItems: "center" }}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
              </View>
              <Text style={styles.title}>{t("forgotPassword.successTitle")}</Text>
              <Text style={styles.subtitle}>{t("forgotPassword.successSubtitle")}</Text>

              <TouchableOpacity style={styles.primaryBtn} onPress={onClose}>
                <Text style={styles.primaryBtnText}>{t("forgotPassword.backToLogin")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(5,36,67,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  closeBtn: {
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#052443",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#767676",
    textAlign: "center",
    marginBottom: 20,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 12,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 10,
  },
  input: { flex: 1, fontSize: 15 },
  primaryBtn: {
    backgroundColor: "#052443",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  linkText: {
    color: "#39CCCC",
    textAlign: "center",
    fontWeight: "600",
  },
  successIcon: {
    marginBottom: 16,
  },
});