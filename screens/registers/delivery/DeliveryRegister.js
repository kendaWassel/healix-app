import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, ActivityIndicator, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../../utils/apiClient";

export default function DeliveryRegister() {
  const { t } = useTranslation();
  const [passwordShown, setPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [licenseFileName, setLicenseFileName] = useState("");
  const navigation = useNavigation();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoPreview(result.assets[0].uri);
      setPhotoFile(result.assets[0]);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      setLicenseFileName(result.assets[0].name);
      setLicenseFile(result.assets[0]);
    }
  };

  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("image", {
      uri: photoFile.uri, name: "photo.jpg", type: "image/jpeg",
    });
    formData.append("category", "profile");
    const res = await apiFetch(`/api/uploads/image`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(t("deliveryRegister.imageUploadFailed"));
    return (await res.json()).image_id;
  };

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("file", {
      uri: licenseFile.uri,
      name: licenseFile.name,
      type: licenseFile.mimeType || "application/pdf",
    });
    formData.append("category", "certificate");
    const res = await apiFetch(`/api/uploads`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(t("deliveryRegister.fileUploadFailed"));
    return (await res.json()).file_id;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const imageId = photoFile ? await uploadImage() : null;
      const fileId = licenseFile ? await uploadFile() : null;
      const user = {
        role: "delivery",
        full_name: fullName,
        email,
        delivery_image_id: imageId,
        phone,
        password,
        vehicle_type: vehicleType,
        plate_number: plateNumber,
        driving_license_id: fileId,
      };
      const res = await apiFetch(`/api/auth/register`, {
        method: "POST",
        body: JSON.stringify(user),
      });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(t("deliveryRegister.serverUnavailable"));
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("deliveryRegister.registrationFailed"));
      setSuccessMsg(t("deliveryRegister.checkEmailActivation"));
      setTimeout(() => navigation.navigate("Login"), 800);
    } catch (err) {
      setError(err.message || t("deliveryRegister.createUserFailed"));
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
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{t("deliveryRegister.title")}</Text>
        <Text style={styles.subtitle}>{t("deliveryRegister.subtitle")}</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        {successMsg && <Text style={styles.success}>{successMsg}</Text>}
      </View>

      {/* الصورة */}
      <TouchableOpacity style={styles.photoCircle} onPress={pickImage}>
        {photoPreview ? (
          <Image source={{ uri: photoPreview }} style={styles.photoImg} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera" size={26} color="#39CCCC" />
            <Text style={styles.photoText}>{t("deliveryRegister.addPhoto")}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.form}>
        {/* الاسم */}
        <View style={styles.inputGroup}>
          <Ionicons name="person" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder={t("deliveryRegister.fullNamePlaceholder")}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* الهاتف */}
        <View style={styles.inputGroup}>
          <Ionicons name="call" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder={t("deliveryRegister.phonePlaceholder")}
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
            placeholder={t("deliveryRegister.emailPlaceholder")}
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
            placeholder={t("deliveryRegister.passwordPlaceholder")}
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

        {/* نوع المركبة */}
        <View style={styles.inputGroup}>
          <Ionicons name="car" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder={t("deliveryRegister.vehicleTypePlaceholder")}
            value={vehicleType}
            onChangeText={setVehicleType}
          />
        </View>

        {/* رقم اللوحة */}
        <View style={styles.inputGroup}>
          <Ionicons name="pricetag" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder={t("deliveryRegister.plateNumberPlaceholder")}
            keyboardType="numeric"
            value={plateNumber}
            onChangeText={setPlateNumber}
          />
        </View>

        {/* رخصة القيادة */}
        <TouchableOpacity style={styles.inputGroup} onPress={pickDocument}>
          <Ionicons name="cloud-upload" size={20} color="#39CCCC" />
          <Text style={styles.fileText} numberOfLines={1}>
            {licenseFileName || t("deliveryRegister.uploadLicenseFile")}
          </Text>
        </TouchableOpacity>

        {/* زر التسجيل */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t("deliveryRegister.registerButton")}</Text>
          )}
        </TouchableOpacity>
      </View>
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
  title: { fontSize: 22, fontWeight: "bold", color: "#052443", textAlign: "center" },
  subtitle: { fontSize: 15, color: "#767676", marginTop: 6 },
  error: { color: "red", fontWeight: "600", marginTop: 8, textAlign: "center" },
  success: { color: "green", fontWeight: "600", marginTop: 8, textAlign: "center" },
  photoCircle: {
    width: 90, height: 90, borderRadius: 45, borderWidth: 2,
    borderColor: "#A1A1A1", alignSelf: "center", overflow: "hidden",
    marginBottom: 20,
  },
  photoImg: { width: "100%", height: "100%" },
  photoPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  photoText: { fontSize: 10, color: "#767676", marginTop: 4 },
  form: { paddingHorizontal: 24 },
  inputGroup: {
    flexDirection: "row", alignItems: "center", borderWidth: 1,
    borderColor: "#e0e0e0", borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 4, marginVertical: 7, gap: 10,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 10 },
  fileText: { flex: 1, color: "#767676", fontSize: 14 },
  button: {
    backgroundColor: "#052443", padding: 16, borderRadius: 10,
    alignItems: "center", marginTop: 18,
  },
  buttonDisabled: { backgroundColor: "#9ca3af" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});