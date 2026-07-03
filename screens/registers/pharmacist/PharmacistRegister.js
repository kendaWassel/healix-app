import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";
import MapPicker from "../patient/MapPicker";

const API = "https://unjuicy-schizogenous-gibson.ngrok-free.dev";

export default function PharmacistRegister() {
  const [passwordShown, setPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [pharmacyName, setPharmacyName] = useState("");
  const [crNumber, setCrNumber] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [fromTime, setFromTime] = useState(null);
  const [toTime, setToTime] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [certificateFile, setCertificateFile] = useState(null);
  const [certificateFileName, setCertificateFileName] = useState("");

  const navigation = useNavigation();

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      setCertificateFileName(result.assets[0].name);
      setCertificateFile(result.assets[0]);
    }
  };

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("file", {
      uri: certificateFile.uri,
      name: certificateFile.name,
      type: certificateFile.mimeType || "application/pdf",
    });
    formData.append("category", "certificate");
    const res = await fetch(`${API}/api/uploads`, {
      method: "POST",
      headers: { "ngrok-skip-browser-warning": "true" },
      body: formData,
    });
    if (!res.ok) throw new Error("File upload failed");
    return (await res.json()).file_id;
  };

  const formatTime = (date) => {
    if (!date) return "";
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const fileId = certificateFile ? await uploadFile() : null;

      const user = {
        role: "pharmacist",
        full_name: fullName,
        email,
        phone,
        password,
        pharmacy_name: pharmacyName,
        cr_number: crNumber,
        license_file_id: fileId,
        from: formatTime(fromTime),
        to: formatTime(toTime),
        address,
        latitude,
        longitude,
      };

      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(user),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Server unavailable. Please try again later.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setSuccessMsg("Check your email for Activation link");
      setTimeout(() => navigation.navigate("Login"), 800);
    } catch (err) {
      setError(err.message || "Failed to create user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* رأس مع زر رجوع */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backArrow}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0d3b66" />
        </TouchableOpacity>
        <Text style={styles.title}>Pharmacists Account Setup</Text>
        <Text style={styles.subtitle}>Fill your information to register</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        {successMsg && <Text style={styles.success}>{successMsg}</Text>}
      </View>

      <View style={styles.form}>
        {/* الاسم */}
        <View style={styles.inputGroup}>
          <Ionicons name="person" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder="Type Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* الهاتف */}
        <View style={styles.inputGroup}>
          <Ionicons name="call" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder="Type Phone Number"
            keyboardType="numeric"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* الإيميل */}
        <View style={styles.inputGroup}>
          <Ionicons name="mail" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder="Type Email"
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
            placeholder="Type Password"
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

        {/* ساعات العمل: من */}
        <TouchableOpacity
          style={styles.inputGroup}
          onPress={() => setShowFromPicker(true)}
        >
          <Ionicons name="time" size={20} color="#39CCCC" />
          <Text style={styles.dateText}>
            {fromTime ? formatTime(fromTime) : "From"}
          </Text>
        </TouchableOpacity>
        {showFromPicker && (
          <DateTimePicker
            value={fromTime || new Date()}
            mode="time"
            display="default"
            onChange={(event, selected) => {
              setShowFromPicker(Platform.OS === "ios");
              if (selected) setFromTime(selected);
            }}
          />
        )}

        {/* ساعات العمل: إلى */}
        <TouchableOpacity
          style={styles.inputGroup}
          onPress={() => setShowToPicker(true)}
        >
          <Ionicons name="time" size={20} color="#39CCCC" />
          <Text style={styles.dateText}>
            {toTime ? formatTime(toTime) : "To"}
          </Text>
        </TouchableOpacity>
        {showToPicker && (
          <DateTimePicker
            value={toTime || new Date()}
            mode="time"
            display="default"
            onChange={(event, selected) => {
              setShowToPicker(Platform.OS === "ios");
              if (selected) setToTime(selected);
            }}
          />
        )}

        {/* العنوان */}
        <View style={styles.inputGroup}>
          <Ionicons name="location" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder="Type Location.."
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* زر الخريطة */}
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => setIsMapOpen(true)}
        >
          <Ionicons name="map" size={18} color="#333" />
          <Text style={styles.mapButtonText}>
            {latitude ? "Location selected ✓" : "Location in map"}
          </Text>
        </TouchableOpacity>

        {/* رفع الشهادة */}
        <TouchableOpacity style={styles.inputGroup} onPress={pickDocument}>
          <Ionicons name="cloud-upload" size={20} color="#39CCCC" />
          <Text style={styles.fileText} numberOfLines={1}>
            {certificateFileName || "Medical Certificate"}
          </Text>
        </TouchableOpacity>

        {/* اسم الصيدلية */}
        <View style={styles.inputGroup}>
          <Ionicons name="storefront" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder="Pharmacy Name"
            value={pharmacyName}
            onChangeText={setPharmacyName}
          />
        </View>

        {/* رقم السجل التجاري */}
        <View style={styles.inputGroup}>
          <Ionicons name="document-text" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder="CR Number"
            keyboardType="numeric"
            value={crNumber}
            onChangeText={setCrNumber}
          />
        </View>

        {/* زر التسجيل */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>
      </View>

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
    paddingTop: Platform.OS === "ios" ? 55 : 35, marginBottom: 16,
  },
  backArrow: { position: "absolute", left: 20, top: Platform.OS === "ios" ? 55 : 35 },
  title: { fontSize: 22, fontWeight: "bold", color: "#0d3b66", textAlign: "center" },
  subtitle: { fontSize: 15, color: "#767676", marginTop: 6 },
  error: { color: "red", fontWeight: "600", marginTop: 8, textAlign: "center" },
  success: { color: "green", fontWeight: "600", marginTop: 8, textAlign: "center" },

  form: { paddingHorizontal: 24 },
  inputGroup: {
    flexDirection: "row", alignItems: "center", borderWidth: 1.5,
    borderColor: "#ccc", borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 4, marginVertical: 7, gap: 10,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 10 },
  dateText: { flex: 1, fontSize: 15, color: "#333", paddingVertical: 10 },
  fileText: { flex: 1, color: "#828181", fontSize: 14 },

  mapButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderWidth: 1.5, borderColor: "#ccc", borderRadius: 12,
    padding: 14, marginVertical: 8,
  },
  mapButtonText: { color: "#333", fontSize: 15 },

  button: {
    backgroundColor: "#0a3460", padding: 16, borderRadius: 12,
    alignItems: "center", marginTop: 18,
  },
  buttonDisabled: { backgroundColor: "#9ca3af" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});