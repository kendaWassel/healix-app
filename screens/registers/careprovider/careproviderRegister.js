import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, ActivityIndicator, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../../utils/apiClient";

export default function CareProviderRegister() {
  const { t } = useTranslation();
  const [passwordShown, setPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("");
  const [gender, setGender] = useState("");
  const [sessionFee, setSessionFee] = useState("");
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
    if (!res.ok) throw new Error(t("careProviderRegister.imageUploadFailed"));
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
    if (!res.ok) throw new Error(t("careProviderRegister.fileUploadFailed"));
    return (await res.json()).file_id;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const imageId = await uploadImage();
      const fileId = await uploadFile();
      const user = {
        role: "care_provider", full_name: fullName, email,
        care_provider_image_id: imageId, phone, password, type, gender,
        session_fee: parseInt(sessionFee) || 0, license_file_id: fileId,
      };
      const res = await apiFetch(`/api/auth/register`, {
        method: "POST",
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("careProviderRegister.registrationFailed"));
      setSuccessMsg(t("careProviderRegister.checkEmailActivation"));
      setTimeout(() => navigation.navigate("Login"), 800);
    } catch (err) {
      setError(err.message || t("careProviderRegister.createUserFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* رأس بسيط مع زر رجوع */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#052443" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("careProviderRegister.title")}</Text>
        <View style={{ width: 26 }} />
      </View>
      <Text style={styles.subtitle}>{t("careProviderRegister.subtitle")}</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {successMsg && <Text style={styles.success}>{successMsg}</Text>}

      {/* الصورة */}
      <TouchableOpacity style={styles.photoCircle} onPress={pickImage}>
        {photoPreview ? (
          <Image source={{ uri: photoPreview }} style={styles.photoImg} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera" size={26} color="#39CCCC" />
            <Text style={styles.photoText}>{t("careProviderRegister.addPhoto")}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.form}>
        {/* الاسم */}
        <View style={styles.inputGroup}>
          <Ionicons name="person" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder={t("careProviderRegister.fullNamePlaceholder")}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* الهاتف */}
        <View style={styles.inputGroup}>
          <Ionicons name="call" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder={t("careProviderRegister.phonePlaceholder")}
            keyboardType="numeric"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* النوع والجنس بجانب بعض */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.half]}>
            <Ionicons name="briefcase" size={18} color="#39CCCC" />
            <Picker style={styles.picker} selectedValue={type} onValueChange={setType}>
              <Picker.Item label={t("careProviderRegister.typePlaceholder")} value="" />
              <Picker.Item label={t("careProviderRegister.physio")} value="physiotherapist" />
              <Picker.Item label={t("careProviderRegister.nurse")} value="nurse" />
            </Picker>
          </View>
          <View style={[styles.inputGroup, styles.half]}>
            <Ionicons name="male-female" size={18} color="#39CCCC" />
            <Picker style={styles.picker} selectedValue={gender} onValueChange={setGender}>
              <Picker.Item label={t("careProviderRegister.genderPlaceholder")} value="" />
              <Picker.Item label={t("careProviderRegister.female")} value="female" />
              <Picker.Item label={t("careProviderRegister.male")} value="male" />
            </Picker>
          </View>
        </View>

        {/* الإيميل */}
        <View style={styles.inputGroup}>
          <Ionicons name="mail" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder={t("careProviderRegister.emailPlaceholder")}
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
            placeholder={t("careProviderRegister.passwordPlaceholder")}
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

        {/* رفع الشهادة */}
        <TouchableOpacity style={styles.inputGroup} onPress={pickDocument}>
          <Ionicons name="cloud-upload" size={20} color="#39CCCC" />
          <Text style={styles.fileText} numberOfLines={1}>
            {licenseFileName || t("careProviderRegister.uploadLicenseFile")}
          </Text>
        </TouchableOpacity>

        {/* الرسوم */}
        <View style={styles.inputGroup}>
          <Ionicons name="cash" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder={t("careProviderRegister.sessionFeePlaceholder")}
            keyboardType="numeric"
            value={sessionFee}
            onChangeText={setSessionFee}
          />
          <Text style={styles.dollar}>$</Text>
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
            <Text style={styles.buttonText}>{t("careProviderRegister.registerButton")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", flexGrow: 1, paddingBottom: 40 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 17, fontWeight: "600", color: "#052443" },
  subtitle: {
    fontSize: 15, color: "#767676", textAlign: "center", marginBottom: 16,
  },
  error: { color: "red", textAlign: "center", marginBottom: 8, paddingHorizontal: 20 },
  success: { color: "green", textAlign: "center", marginBottom: 8, paddingHorizontal: 20 },
  photoCircle: {
    width: 90, height: 90, borderRadius: 45, borderWidth: 1,
    borderColor: "#e0e0e0", alignSelf: "center", overflow: "hidden",
    marginBottom: 20,
  },
  photoImg: { width: "100%", height: "100%" },
  photoPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  photoText: { fontSize: 10, color: "#767676", marginTop: 4 },
  form: { paddingHorizontal: 24 },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  inputGroup: {
    flexDirection: "row", alignItems: "center", borderWidth: 1,
    borderColor: "#e0e0e0", borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 4, marginVertical: 7, gap: 8,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 10 },
  picker: { flex: 1, color: "#767676" },
  fileText: { flex: 1, color: "#767676", fontSize: 14 },
  dollar: { color: "#767676", fontSize: 16 },
  button: {
    backgroundColor: "#052443", padding: 16, borderRadius: 10,
    alignItems: "center", marginTop: 18,
  },
  buttonDisabled: { backgroundColor: "#9ca3af" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});