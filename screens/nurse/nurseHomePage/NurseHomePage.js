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
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import NurseHeader from "../../Components/header/NurseHeader";
import Footer from "../../Components/footer/Footer";
import { colors } from "../../../constants/colors";
import { BASE_URL, NGROK_HEADERS } from "../../../constants/api";
import useProviderLocationTracking from '../../Components/common/useProviderLocationTracking'
import i18n from "../../../i18n/i18n";

const NurseHomePage = () => {
  useProviderLocationTracking(true);
  const { t } = useTranslation();
  const [passwordShown, setPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
  const [dataBeforeEdit, setDataBeforeEdit] = useState(null);


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
          "Accept-Language": i18n.language,
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
          gender: profile.gender || "",
          license_file: null,
        });
        if (profile.license_file_url) {
          setLicenseFilePreview(profile.license_file_url);
          setLicenseFileName(profile.license_file_name || "Current License");
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError(err.message || t("nurse.nurseHome.loadFail"));
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
        "Accept-Language": i18n.language,
      },
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || t("nurse.nurseHome.uploadFail"));
    }
    const data = await response.json();
    return data.file_id;
  };

  const handleStartEdit = () => {
    setDataBeforeEdit(nurseData);
    setIsEditing(true);
    setError(null);
    setSuccessMsg(null);
  };

  const handleCancelEdit = () => {
    if (dataBeforeEdit) {
      setNurseData(dataBeforeEdit);
    }
    setLicenseFile(null);
    setIsEditing(false);
    setError(null);
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
          "Accept-Language": i18n.language,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || "Update failed");
      }

      const data = await response.json();
      if (data.status === "success") {
        setSuccessMsg(t("nurse.nurseHome.updateSuccess"));
        setNurseData({ ...nurseData, password: "" });
        if (licenseFile) setLicenseFile(null);
        setIsEditing(false);
        setDataBeforeEdit(null);
        setTimeout(() => {
          setSuccessMsg(null);
          fetchNurseProfile();
        }, 2000);
      }
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || t("nurse.nurseHome.updateFail"));
    } finally {
      setIsUpdating(false);
    }
  };

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

  return (
    <View style={{ flex: 1 }}>
      <NurseHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.actionsRow}>
          {!isEditing ? (
            <TouchableOpacity
              style={[styles.updateBtn, isLoading && styles.disabledBtn]}
              onPress={handleStartEdit}
              disabled={isLoading}
            >
              <Text style={styles.updateBtnText}>{t("nurse.nurseHome.update")}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.saveBtn, isUpdating && styles.disabledBtn]}
                onPress={handleSubmit}
                disabled={isUpdating}
              >
                <Text style={styles.updateBtnText}>
                  {isUpdating ? t("nurse.nurseHome.updating") : t("nurse.nurseHome.save")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelBtn, isUpdating && styles.disabledBtn]}
                onPress={handleCancelEdit}
                disabled={isUpdating}
              >
                <Text style={styles.cancelBtnText}>{t("nurse.nurseHome.cancel")}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{t("nurse.nurseHome.title")}</Text>
            <Text style={styles.subtitle}>{t("nurse.nurseHome.subtitle")}</Text>
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
              {t("nurse.nurseHome.loadingProfile")}
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
              <Text style={styles.label}>{t("nurse.nurseHome.fullName")}</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="user-circle" size={20} color={colors.cyan} />
                <TextInput
                  style={styles.input}
                  value={nurseData.full_name}
                  onChangeText={(val) =>
                    setNurseData({ ...nurseData, full_name: val })
                  }
                  editable={isEditing}
                />
              </View>
            </View>

            {/* Email */}
            <View>
              <Text style={styles.label}>{t("nurse.nurseHome.email")}</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="envelope" size={18} color={colors.cyan} />
                <TextInput
                  style={styles.input}
                  value={nurseData.email}
                  onChangeText={(val) =>
                    setNurseData({ ...nurseData, email: val })
                  }
                  editable={isEditing}
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Phone */}
            <View>
              <Text style={styles.label}>{t("nurse.nurseHome.phone")}</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="phone-alt" size={18} color={colors.cyan} />
                <TextInput
                  style={styles.input}
                  value={nurseData.phone}
                  onChangeText={(val) =>
                    setNurseData({ ...nurseData, phone: val })
                  }
                  editable={isEditing}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Password */}
            <View>
              <Text style={styles.label}>{t("nurse.nurseHome.password")}</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="lock" size={18} color={colors.cyan} />
                <TextInput
                  style={styles.input}
                  value={nurseData.password}
                  onChangeText={(val) =>
                    setNurseData({ ...nurseData, password: val })
                  }
                  placeholder={t("nurse.nurseHome.passwordPlaceholder")}
                  secureTextEntry={!passwordShown}
                  editable={isEditing}
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

            {/* Gender */}
            <View>
              <Text style={styles.label}>{t("nurse.nurseHome.gender")}</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="venus-mars" size={18} color={colors.cyan} />
                <Picker
                  enabled={isEditing}
                  selectedValue={nurseData.gender}
                  onValueChange={(val) =>
                    setNurseData({ ...nurseData, gender: val })
                  }
                  style={styles.picker}
                >
                  <Picker.Item
                    label={t("nurse.nurseHome.genderPlaceholder")}
                    value=""
                  />
                  <Picker.Item
                    label={t("nurse.nurseHome.genderFemale")}
                    value="female"
                  />
                  <Picker.Item label={t("nurse.nurseHome.genderMale")} value="male" />
                </Picker>
              </View>
            </View>

            {/* Session Fee */}
            <View>
              <Text style={styles.label}>{t("nurse.nurseHome.sessionFee")}</Text>
              <View style={styles.inputGroup}>
                <FontAwesome5 name="hand-holding-usd" size={18} color={colors.cyan} />
                <TextInput
                  style={styles.input}
                  value={String(nurseData.session_fee)}
                  onChangeText={(val) =>
                    setNurseData({ ...nurseData, session_fee: val })
                  }
                  editable={isEditing}
                  keyboardType="numeric"
                />
                <Text style={{ color: colors.textColor }}>$</Text>
              </View>
            </View>

            {/* License File */}
            <View>
              <Text style={styles.label}>{t("nurse.nurseHome.licenseFile")}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <TouchableOpacity
                  style={styles.fileBtn}
                  onPress={pickLicenseFile}
                  disabled={!isEditing}
                >
                  <FontAwesome5 name="file-upload" size={20} color={colors.cyan} />
                  <Text style={styles.fileBtnText}>
                    {licenseFileName || t("nurse.nurseHome.viewFile")}
                  </Text>
                </TouchableOpacity>
                {licenseFilePreview && !licenseFile && (
                  <TouchableOpacity>
                    <Text style={styles.viewCurrentLink}>
                      {t("nurse.nurseHome.viewCurrent")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
        <Footer />
      </ScrollView>
    </View>
  );
};

export default NurseHomePage;

const styles = StyleSheet.create({
  container: { padding: 24, flexGrow: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#0a3460" },
  subtitle: {
    color: colors.textColor,
    fontWeight: "500",
    marginTop: 8,
    fontSize: 15,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  updateBtn: {
    backgroundColor: "#0a3460",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtn: {
    backgroundColor: "#0a3460",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  cancelBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  cancelBtnText: { color: colors.gray700, fontWeight: "600" },
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
  picker: { flex: 1, color: colors.textColor },
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