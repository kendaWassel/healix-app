import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import MedicalReportModal, { uploadImage, uploadFile } from "./MedicalReportModal";
import MapPicker from "./MapPicker";

export default function PatientRegister() {
  const { t } = useTranslation();
  const [passwordShown, setPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState(null);
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [medicalReport, setMedicalReport] = useState(null);

  const navigation = useNavigation();

  const handleSaveMedicalReport = (report) => {
    setMedicalReport(report);
    setIsMedicalModalOpen(false);
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    if (!medicalReport) {
      setIsLoading(false);
      setError(t("patientRegister.medicalReportRequired"));
      return;
    }

    try {
      let imageId = null;
      let fileId = null;
      if (medicalReport.photoFile) imageId = await uploadImage(medicalReport.photoFile);
      if (medicalReport.medicalFile) fileId = await uploadFile(medicalReport.medicalFile);

      const user = {
        role: "patient",
        full_name: fullName,
        email,
        phone,
        password,
        birth_date: birthDate ? birthDate.toISOString().split("T")[0] : null,
        gender,
        address,
        latitude,
        longitude,
        medical_record: {
          diagnosis: medicalReport.diagnosis || "",
          chronic_diseases: medicalReport.chronic_diseases || "",
          previous_surgeries: medicalReport.previous_surgeries || "",
          allergies: medicalReport.allergies || "",
          is_pregnant: medicalReport.is_pregnant || "",
          current_medications: medicalReport.current_medications || "",
          attachments: [imageId, fileId],
        },
      };

      const res = await fetch(
        "https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(user),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("patientRegister.registrationFailed"));

      setSuccessMsg(t("patientRegister.checkEmailActivation"));
      setTimeout(() => navigation.navigate("Login"), 800);
    } catch (err) {
      setError(err.message || t("patientRegister.createUserFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backArrow}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{t("patientRegister.title")}</Text>
        <Text style={styles.subtitle}>{t("patientRegister.subtitle")}</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        {successMsg && <Text style={styles.success}>{successMsg}</Text>}
      </View>

      <View style={styles.form}>
        {/* الاسم والهاتف */}
        <View style={styles.inputGroup}>
          <Ionicons name="person-circle" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder={t("patientRegister.fullNamePlaceholder")}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="call" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder={t("patientRegister.phonePlaceholder")}
            keyboardType="numeric"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* تاريخ الميلاد */}
        <TouchableOpacity
          style={styles.inputGroup}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={20} color="#39CCCC" />
          <Text style={styles.dateText}>
            {birthDate ? birthDate.toLocaleDateString() : t("patientRegister.birthDatePlaceholder")}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthDate || new Date(2000, 0, 1)}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === "ios");
              if (selectedDate) setBirthDate(selectedDate);
            }}
          />
        )}

        {/* الإيميل */}
        <View style={styles.inputGroup}>
          <Ionicons name="mail" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder={t("patientRegister.emailPlaceholder")}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* كلمة المرور */}
        <View style={styles.inputGroup}>
          <Ionicons name="lock-closed" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder={t("patientRegister.passwordPlaceholder")}
            secureTextEntry={!passwordShown}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setPasswordShown(!passwordShown)}>
            <Ionicons
              name={passwordShown ? "eye" : "eye-off"}
              size={20}
              color="#767676"
            />
          </TouchableOpacity>
        </View>

        {/* الجنس */}
     <Text style={styles.genderLabel}>{t("patientRegister.genderPlaceholder")}</Text>
<View style={styles.genderOptionsRow}>
  <TouchableOpacity
    onPress={() => setGender("male")}
    style={[
      styles.genderOption,
      gender === "male" && styles.genderOptionSelected,
    ]}
  >
    <Ionicons
      name="male"
      size={18}
      color={gender === "male" ? "#0e7490" : "#767676"}
    />
    <Text
      style={[
        styles.genderOptionText,
        gender === "male" && styles.genderOptionTextSelected,
      ]}
    >
      {t("patientRegister.male")}
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => setGender("female")}
    style={[
      styles.genderOption,
      gender === "female" && styles.genderOptionSelected,
    ]}
  >
    <Ionicons
      name="female"
      size={18}
      color={gender === "female" ? "#0e7490" : "#767676"}
    />
    <Text
      style={[
        styles.genderOptionText,
        gender === "female" && styles.genderOptionTextSelected,
      ]}
    >
      {t("patientRegister.female")}
    </Text>
  </TouchableOpacity>
</View>
        {/* العنوان */}
        <View style={styles.inputGroup}>
          <Ionicons name="location" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder={t("patientRegister.addressPlaceholder")}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* زر الموقع على الخريطة */}
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => setIsMapOpen(true)}
        >
          <Ionicons name="map" size={18} color="#333" />
          <Text style={styles.mapButtonText}>
            {latitude ? t("patientRegister.locationSelected") : t("patientRegister.locationInMap")}
          </Text>
        </TouchableOpacity>

        {/* التقرير الطبي */}
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => setIsMedicalModalOpen(true)}
        >
          <Ionicons name="cloud-upload" size={18} color="#333" />
          <Text style={styles.mapButtonText}>
            {medicalReport ? t("patientRegister.editMedicalReport") : t("patientRegister.addMedicalReport")}
          </Text>
        </TouchableOpacity>

        {/* زر التسجيل */}
        <TouchableOpacity
          style={[styles.registerBtn, isLoading && styles.registerBtnDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerBtnText}>{t("patientRegister.register")}</Text>
          )}
        </TouchableOpacity>
      </View>

      <MedicalReportModal
        open={isMedicalModalOpen}
        onClose={() => setIsMedicalModalOpen(false)}
        onSubmit={handleSaveMedicalReport}
        initialValues={medicalReport}
        gender={gender}
      />
      <MapPicker
        visible={isMapOpen}
        initialPosition={latitude && longitude ? [latitude, longitude] : null}
        onConfirm={(lat, lng) => {
          setLatitude(lat);
          setLongitude(lng);
          setIsMapOpen(false);
        }}
        onClose={() => setIsMapOpen(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", flexGrow: 1, paddingBottom: 40 },
  header: {
    alignItems: "center", paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 55 : 35, marginBottom: 20,
  },
  backArrow: { position: "absolute", left: 20, top: Platform.OS === "ios" ? 55 : 35 },
  title: { fontSize: 22, fontWeight: "bold", color: "#003366" },
  subtitle: { fontSize: 15, color: "#666", marginTop: 6 },
  error: { color: "red", fontWeight: "600", marginTop: 8 },
  success: { color: "green", fontWeight: "600", marginTop: 8 },

  form: { paddingHorizontal: 24 },
  inputGroup: {
    flexDirection: "row", alignItems: "center", borderWidth: 1,
    borderColor: "#e0e0e0", borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 4, marginVertical: 7, gap: 10,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 10 },
  dateText: { flex: 1, fontSize: 15, color: "#333", paddingVertical: 10 },
  picker: { flex: 1, color: "#767676" },

  mapButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 10,
    padding: 14, marginVertical: 8,
  },
  mapButtonText: { color: "#333", fontSize: 15 },

  registerBtn: {
    backgroundColor: "#052443", padding: 16, borderRadius: 10,
    alignItems: "center", marginTop: 16,
  },
  registerBtnDisabled: { backgroundColor: "#9ca3af" },
  registerBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  genderLabel: {
  fontSize: 13,
  fontWeight: "600",
  color: "#374151",
  marginTop: 12,
  marginBottom: 6,
},
genderOptionsRow: {
  flexDirection: "row",
  gap: 10,
  marginBottom: 8,
},
genderOption: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  borderWidth: 1,
  borderColor: "#e0e0e0",
  borderRadius: 10,
  paddingVertical: 12,
  backgroundColor: "#fff",
},
genderOptionSelected: {
  backgroundColor: "#ecfeff",
  borderColor: "#39CCCC",
},
genderOptionText: {
  fontSize: 14,
  color: "#767676",
  fontWeight: "500",
},
genderOptionTextSelected: {
  color: "#0e7490",
  fontWeight: "700",
},
});