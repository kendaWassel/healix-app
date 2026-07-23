import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PatientHeader from "../../Components/header/PatientHeader";
import Footer from "../../Components/footer/Footer";
import FAID from "./FAID/FAID";
import AI_Medical_Assistant from "../AIMedicalAssistant/AIMedicalAssistant";
import { LinearGradient } from "expo-linear-gradient";

export default function PatientHomePage() {
  const { t } = useTranslation();
  const [passwordShown, setPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showSymptomChat, setShowSymptomChat] = useState(false);

  const [patientData, setPatientData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    birth_date: "",
    gender: "",
    address: "",
  });

  const [licenseFileName] = useState("");

  const fetchPatientProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        "https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patient/profile",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || t("patientHome.loadProfileFailed"));
      }

      const data = await response.json();
      console.log("Patient profile:", data);

      if (data.status === "success" && data.data) {
        const profile = data.data;
        setPatientData({
          full_name: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          password: "",
          birth_date: profile.birth_date || "",
          gender: profile.gender || "",
          address: profile.address || "",
        });
      }
    } catch (err) {
      console.error("Failed fetching patient profile:", err);
      setError(err.message || t("patientHome.loadProfileFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = await AsyncStorage.getItem("token");

      const updateData = {
        full_name: patientData.full_name,
        email: patientData.email,
        phone: patientData.phone,
        birth_date: patientData.birth_date,
        gender: patientData.gender,
        address: patientData.address,
      };

      if (patientData.password) {
        updateData.password = patientData.password;
      }

      const response = await fetch(
        "https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patient/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();
      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || t("patientHome.updateFailed"));
      }

      setSuccessMsg(t("patientHome.updateSuccess"));
      setPatientData((prev) => ({ ...prev, password: "" }));
      setTimeout(() => {
        setSuccessMsg(null);
        fetchPatientProfile();
      }, 2000);
    } catch (err) {
      setError(err.message || t("patientHome.updateFailed"));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={styles.screen}>
      <PatientHeader />

      {/* Chat Bot Button */}
      <View style={styles.chatBotWrapper}>
        <TouchableOpacity onPress={() => setShowSymptomChat(true)} activeOpacity={0.9}>
          <LinearGradient
            colors={["#052443", "#0a3d62"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.chatBotBtn}
          >
            <View style={styles.chatBotIconCircle}>
              <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.chatBotTitle}>{t("patientHome.checkSymptoms")}</Text>
              <Text style={styles.chatBotSubtitle}>{t("patientHome.checkSymptomsDesc")}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* الرأس + زر التحديث */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{t("patientHome.title")}</Text>
            <Text style={styles.subtitle}>{t("patientHome.subtitle")}</Text>
          </View>
          <TouchableOpacity
            style={[styles.updateBtn, (isUpdating || isLoading) && styles.updateBtnDisabled]}
            onPress={handleUpdate}
            disabled={isUpdating || isLoading}
          >
            {isUpdating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.updateBtnText}>{t("patientHome.update")}</Text>
            )}
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorBox}>{error}</Text>}
        {successMsg && <Text style={styles.successBox}>{successMsg}</Text>}

        {isLoading ? (
          <Text style={styles.loadingText}>{t("patientHome.loadingProfile")}</Text>
        ) : (
          <View style={styles.form}>
            {/* الاسم الكامل */}
            <View style={styles.field}>
              <Text style={styles.label}>{t("patientHome.fullName")}</Text>
              <View style={styles.inputGroup}>
                <Ionicons name="person" size={20} color="#39CCCC" />
                <TextInput
                  style={styles.input}
                  value={patientData.full_name}
                  onChangeText={(t2) => setPatientData({ ...patientData, full_name: t2 })}
                />
              </View>
            </View>

            {/* الإيميل */}
            <View style={styles.field}>
              <Text style={styles.label}>{t("patientHome.email")}</Text>
              <View style={styles.inputGroup}>
                <Ionicons name="mail" size={20} color="#39CCCC" />
                <TextInput
                  style={styles.input}
                  value={patientData.email}
                  onChangeText={(t2) => setPatientData({ ...patientData, email: t2 })}
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* الهاتف */}
            <View style={styles.field}>
              <Text style={styles.label}>{t("patientHome.phone")}</Text>
              <View style={styles.inputGroup}>
                <Ionicons name="call" size={20} color="#39CCCC" />
                <TextInput
                  style={styles.input}
                  value={patientData.phone}
                  onChangeText={(t2) => setPatientData({ ...patientData, phone: t2 })}
                />
              </View>
            </View>

            {/* تاريخ الميلاد */}
            <View style={styles.field}>
              <Text style={styles.label}>{t("patientHome.birthDate")}</Text>
              <View style={styles.inputGroup}>
                <Ionicons name="calendar" size={20} color="#39CCCC" />
                <TextInput
                  style={styles.input}
                  value={patientData.birth_date}
                  placeholder={t("patientHome.notSet")}
                  onChangeText={(t2) => setPatientData({ ...patientData, birth_date: t2 })}
                />
              </View>
            </View>

         

            {/* الجنس */}
            <View style={styles.field}>
              <Text style={styles.label}>{t("patientHome.gender")}</Text>
              <View style={styles.inputGroup}>
                <Ionicons name="male-female" size={20} color="#39CCCC" />
                <TextInput
                  style={styles.input}
                  value={patientData.gender}
                  editable={false}
                />
              </View>
            </View>

            {/* العنوان */}
            <View style={styles.field}>
              <Text style={styles.label}>{t("patientHome.address")}</Text>
              <View style={styles.inputGroup}>
                <Ionicons name="location" size={20} color="#39CCCC" />
                <TextInput
                  style={styles.input}
                  placeholder={t("patientHome.addressPlaceholder")}
                  value={patientData.address}
                  onChangeText={(t2) => setPatientData({ ...patientData, address: t2 })}
                />
              </View>
            </View>

         
          </View>
        )}
        <FAID />
        <Footer />
      </ScrollView>

      <AI_Medical_Assistant
        isOpen={showSymptomChat}
        onClose={() => setShowSymptomChat(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20, paddingBottom: 0 },

  headerRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#0a3460" },
  subtitle: { fontSize: 14, color: "#767676", marginTop: 6 },
  updateBtn: {
    backgroundColor: "#0a3460", paddingHorizontal: 18,
    paddingVertical: 10, borderRadius: 8,
  },
  updateBtnDisabled: { opacity: 0.5 },
  updateBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  errorBox: {
    backgroundColor: "#fee2e2", borderWidth: 1, borderColor: "#fca5a5",
    color: "#b91c1c", padding: 10, borderRadius: 8, marginBottom: 12,
  },
  successBox: {
    backgroundColor: "#dcfce7", borderWidth: 1, borderColor: "#86efac",
    color: "#15803d", padding: 10, borderRadius: 8, marginBottom: 12,
  },
  loadingText: { textAlign: "center", color: "#888", paddingVertical: 20 },

  form: { gap: 4 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  inputGroup: {
    flexDirection: "row", alignItems: "center", borderWidth: 1,
    borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 4, gap: 10,
  },
  input: { flex: 1, fontSize: 14, paddingVertical: 10, color: "#333" },

  mapButton: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, padding: 12,
  },
  mapButtonText: { color: "#374151", fontSize: 14 },

  fileButton: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, padding: 12,
  },
  fileButtonText: { color: "#374151", fontSize: 14 },

  chatBotWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  chatBotBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
  },
  chatBotIconCircle: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 24,
  },
  chatBotTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  chatBotSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 2,
  },
});