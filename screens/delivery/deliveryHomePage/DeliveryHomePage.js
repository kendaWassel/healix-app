import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import DeliveryHeader from "../../Components/header/DeliveryHeader";
import Footer from "../../Components/footer/Footer";
import { colors } from "../../../constants/colors";
import { BASE_URL, NGROK_HEADERS } from "../../../constants/api";

const DeliveryHomePage = () => {
  const { t } = useTranslation();
  const [passwordShown, setPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [nurseData, setNurseData] = useState({
    full_name: "kenda wassel",
    email: "kendawassel14@gmail.com",
    phone: "0943779128",
    password: "123456",
    available_time: "",
    session_fee: "100",
    type: "nurse",
    gender: "female",
    license_file: null,
  });
  const [licenseFile, setLicenseFile] = useState(null);
  const [licenseFileName, setLicenseFileName] = useState("");
  const [licenseFilePreview, setLicenseFilePreview] = useState(null);


  const fetchNurseProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/provider/nurse/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...NGROK_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || "Failed to fetch profile");
      }

      const data = await response.json();
      if (data.status === "success" && data.data) {
        const profile = data.data;
        setNurseData({
          full_name: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          password: "",
          available_time: profile.available_time || "",
          session_fee: profile.session_fee || "",
          type: profile.type || "",
          license_file: null,
        });
        if (profile.license_file_url) {
          setLicenseFilePreview(profile.license_file_url);
          setLicenseFileName(profile.license_file_name || "Current License");
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError(err.message || t("deliveryHome.loadFail"));
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file) => {
    if (!file) return null;
    const token = await AsyncStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "application/octet-stream",
    });
    formData.append("category", "certificate");

    const response = await fetch(`${BASE_URL}/uploads`, {
      method: "POST",
      headers: {
        ...NGROK_HEADERS,
        Authorization: `Bearer ${token}`,
        // NOTE: do NOT set Content-Type manually for multipart in RN —
        // fetch sets the correct boundary automatically.
      },
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || t("deliveryHome.uploadFail"));
    }
    const data = await response.json();
    return data.file_id;
  };

  const handleSubmit = async () => {
    setIsUpdating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = await AsyncStorage.getItem("token");
      let licenseFileId = null;
      if (licenseFile) {
        licenseFileId = await uploadFile(licenseFile);
      }

      const updateData = {
        full_name: nurseData.full_name,
        email: nurseData.email,
        phone: nurseData.phone,
        available_time: nurseData.available_time,
        session_fee: parseInt(nurseData.session_fee) || 0,
        type: nurseData.type,
      };

      if (nurseData.password) {
        updateData.password = nurseData.password;
      }
      if (licenseFileId) {
        updateData.license_file_id = licenseFileId;
      }

      const response = await fetch(`${BASE_URL}/provider/nurse/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...NGROK_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || "Update failed");
      }

      const data = await response.json();
      if (data.status === "success") {
        setSuccessMsg(t("deliveryHome.updateSuccess"));
        setNurseData({ ...nurseData, password: "" });
        if (licenseFile) setLicenseFile(null);
        setTimeout(() => {
          setSuccessMsg(null);
          fetchNurseProfile();
        }, 2000);
      }
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || t("deliveryHome.updateFail"));
    } finally {
      setIsUpdating(false);
    }
  };

  // was: <input type="file" ...> — RN has no native file input, so we
  // open the system document picker instead.
  const pickLicenseFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });
    if (result.canceled) return;
    const file = result.assets[0];
    setLicenseFile(file);
    setLicenseFileName(file.name);
    setLicenseFilePreview(null);
  };

console.log(t("header.home"));

  return (
    <View style={{ flex: 1 }}>
      <DeliveryHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <View>
        <View style={styles.updateContainer}>
          <TouchableOpacity
            style={[styles.updateBtn, (isUpdating || isLoading) && styles.disabledBtn]}
            onPress={handleSubmit}
            disabled={isUpdating || isLoading}
          >
            <Text style={styles.updateBtnText}>
              {isUpdating ? t("deliveryHome.updating") : t("deliveryHome.update")}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{t("deliveryHome.title")}</Text>
            <Text style={styles.subtitle}>{t("deliveryHome.subtitle")}</Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {successMsg && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        )}

        {isLoading ? (
          <View style={{ paddingVertical: 32 }}>
            <Text style={{ textAlign: "center", color: colors.gray500 }}>
              {t("deliveryHome.loadingProfile")}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 22 }}>
            {/* Photo */}
            <View style={styles.photoWrapper}>
              <Image
                source={require("../../../assets/gallery-7.png")}
                style={styles.photoImage}
              />
            </View>

            {/* Full Name */}
            <View>
              <Text style={styles.label}>{t("deliveryHome.fullName")}</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="user-circle" size={20} color={colors.cyan} />
                <TextInput
                  style={styles.input}
                  value={nurseData.full_name}
                  onChangeText={(val) =>
                    setNurseData({ ...nurseData, full_name: val })
                  }
                  editable={false}
                />
              </View>
            </View>

            {/* Email */}
            <View>
              <Text style={styles.label}>{t("deliveryHome.email")}</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="envelope" size={18} color={colors.cyan} />
                <TextInput
                  style={styles.input}
                  value={nurseData.email}
                  onChangeText={(val) => setNurseData({ ...nurseData, email: val })}
                  editable={false}
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Phone */}
            <View>
              <Text style={styles.label}>{t("deliveryHome.phone")}</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="phone-alt" size={18} color={colors.cyan} />
                <TextInput
                  style={styles.input}
                  value={nurseData.phone}
                  onChangeText={(val) => setNurseData({ ...nurseData, phone: val })}
                  editable={false}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Password */}
            <View>
              <Text style={styles.label}>{t("deliveryHome.password")}</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="lock" size={18} color={colors.cyan} />
                <TextInput
                  style={styles.input}
                  value={nurseData.password}
                  onChangeText={(val) =>
                    setNurseData({ ...nurseData, password: val })
                  }
                  placeholder={t("deliveryHome.passwordPlaceholder")}
                  secureTextEntry={!passwordShown}
                  editable={false}
                />
                <TouchableOpacity onPress={() => setPasswordShown(!passwordShown)}>
                  <FontAwesome5
                    name={passwordShown ? "eye-slash" : "eye"}
                    size={18}
                    color={colors.gray500}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Vehicle type */}
            <View>
              <Text style={styles.label}>{t("deliveryHome.vehicleType")}</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="car" size={18} color={colors.cyan} />
                <TextInput style={styles.input} value="Toyota" editable={false} />
              </View>
            </View>

            {/* Plate Number */}
            <View>
              <Text style={styles.label}>{t("deliveryHome.plateNumber")}</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="hashtag" size={18} color={colors.cyan} />
                <TextInput
                  style={styles.input}
                  value="123123"
                  editable={false}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* License File */}
            <View>
              <Text style={styles.label}>{t("deliveryHome.licenseFile")}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <TouchableOpacity
                  style={styles.fileBtn}
                  onPress={pickLicenseFile}
                  disabled // matches original: input was disabled
                >
                  <FontAwesome5 name="file-upload" size={20} color={colors.cyan} />
                  <Text style={styles.fileBtnText}>
                    {licenseFileName || t("deliveryHome.viewFile")}
                  </Text>
                </TouchableOpacity>
                {licenseFilePreview && !licenseFile && (
                  <TouchableOpacity>
                    <Text style={styles.viewCurrentLink}>
                      {t("deliveryHome.viewCurrent")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
        </View>
      <Footer />
      </ScrollView>
    </View>
  );
};

export default DeliveryHomePage;

const styles = StyleSheet.create({
  container: { padding: 24, flexGrow: 1 },

  updateContainer:{
    alignSelf:"flex-start",
    marginBottom:20
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#0a3460" },
  subtitle: { color: colors.textColor, fontWeight: "500", marginTop: 8, fontSize: 15 },
  updateBtn: {
    backgroundColor: "#0a3460",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  disabledBtn: { opacity: 0.5 },
  updateBtnText: { color: colors.white, fontWeight: "600" },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 6,
    padding: 12,
    marginBottom: 14,
  },
  errorText: { color: colors.danger },
  successBox: {
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.successBorder,
    borderRadius: 6,
    padding: 12,
    marginBottom: 14,
  },
  successText: { color: colors.success },
  photoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  photoImage: { width: "100%", height: "100%" },
  label: { fontSize: 14, fontWeight: "600", color: colors.gray700, marginBottom: 8 },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: { flex: 1, fontSize: 15, color: colors.gray800 },
  fileBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  fileBtnText: { fontSize: 14, color: colors.gray700 },
  viewCurrentLink: { color: colors.cyan, fontSize: 14, textDecorationLine: "underline" },
});
