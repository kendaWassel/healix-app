import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PatientHeader from "../../Components/header/PatientHeader";
import Footer from "../../Components/footer/Footer";
import FAID from "./FAID/FAID";

export default function PatientHomePage() {
  const [passwordShown, setPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [patientData] = useState({
    full_name: "kenda wassel",
    email: "kendawassel14@gmail.com",
    phone: "0943779128",
    password: "123456",
    gender: "female",
    address: "",
  });

  const [licenseFileName] = useState("");

  return (
    <View style={styles.screen}>
      <PatientHeader />
      <ScrollView contentContainerStyle={styles.container}>
        {/* الرأس + زر التحديث */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Account Information</Text>
            <Text style={styles.subtitle}>View or update your information</Text>
          </View>
          <TouchableOpacity
            style={[styles.updateBtn, (isUpdating || isLoading) && styles.updateBtnDisabled]}
            disabled={isUpdating || isLoading}
          >
            {isUpdating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.updateBtnText}>Update</Text>
            )}
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorBox}>{error}</Text>}
        {successMsg && <Text style={styles.successBox}>{successMsg}</Text>}

        {isLoading ? (
          <Text style={styles.loadingText}>Loading profile information...</Text>
        ) : (
          <View style={styles.form}>
            {/* الاسم الكامل */}
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputGroup}>
                <Ionicons name="person" size={20} color="#39CCCC" />
                <TextInput
                  style={styles.input}
                  value={patientData.full_name}
                  editable={false}
                />
              </View>
            </View>

            {/* الإيميل */}
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputGroup}>
                <Ionicons name="mail" size={20} color="#39CCCC" />
                <TextInput
                  style={styles.input}
                  value={patientData.email}
                  editable={false}
                />
              </View>
            </View>

            {/* الهاتف */}
            <View style={styles.field}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputGroup}>
                <Ionicons name="call" size={20} color="#39CCCC" />
                <TextInput
                  style={styles.input}
                  value={patientData.phone}
                  editable={false}
                />
              </View>
            </View>

            {/* تاريخ الميلاد */}
            <View style={styles.field}>
              <Text style={styles.label}>Birth date</Text>
              <View style={styles.inputGroup}>
                <Ionicons name="calendar" size={20} color="#39CCCC" />
                <TextInput
                  style={styles.input}
                  placeholder="Not set"
                  editable={false}
                />
              </View>
            </View>

            {/* كلمة المرور */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputGroup}>
                <Ionicons name="lock-closed" size={20} color="#39CCCC" />
                <TextInput
                  style={styles.input}
                  value={patientData.password}
                  secureTextEntry={!passwordShown}
                  editable={false}
                  placeholder="Leave empty to keep current password"
                />
                <TouchableOpacity onPress={() => setPasswordShown(!passwordShown)}>
                  <Ionicons
                    name={passwordShown ? "eye" : "eye-off"}
                    size={18}
                    color="#767676"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* الجنس */}
            <View style={styles.field}>
              <Text style={styles.label}>Gender</Text>
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
              <Text style={styles.label}>Address</Text>
              <View style={styles.inputGroup}>
                <Ionicons name="location" size={20} color="#39CCCC" />
                <TextInput
                  style={styles.input}
                  placeholder="area-street-building-floor-home no"
                  value={patientData.address}
                  editable={false}
                />
              </View>
            </View>

            {/* الموقع على الخريطة */}
            <View style={styles.field}>
              <Text style={styles.label}>Location in map</Text>
              <TouchableOpacity style={styles.mapButton} disabled>
                <Ionicons name="map" size={18} color="#39CCCC" />
                <Text style={styles.mapButtonText}>Location in map</Text>
              </TouchableOpacity>
            </View>

            {/* ملف التقرير الطبي */}
            <View style={styles.field}>
              <Text style={styles.label}>Medical report File</Text>
              <TouchableOpacity style={styles.fileButton} disabled>
                <Ionicons name="document-text" size={18} color="#39CCCC" />
                <Text style={styles.fileButtonText}>
                  {licenseFileName || "View File"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
         <FAID />  
      <Footer />
      </ScrollView>
      
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
});