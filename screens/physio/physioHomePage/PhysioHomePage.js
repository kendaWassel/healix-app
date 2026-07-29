import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import Footer from "../../Components/footer/Footer";
import PhysioHeader from "../../Components/header/PhysioHeader";
import { colors } from "../../../constants/colors";
import { BASE_URL, NGROK_HEADERS } from "../../../constants/api";

const PhysioHomePage = () => {
  const { t } = useTranslation();
  const [passwordShown, setPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [physioData, setPhysioData] = useState({
    full_name: "kenda wassel",
    email: "kendawassel14@gmail.com",
    phone: "0943779128",
    password: "123456",
    available_time: "",
    session_fee: "100",
    type: "physio",
    gender: "female",
    license_file: null,
  });
  const [licenseFile, setLicenseFile] = useState(null);
  const [licenseFileName, setLicenseFileName] = useState("");
  const [licenseFilePreview, setLicenseFilePreview] = useState(null);


  const fetchPhysioProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/provider/nurse/profile`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...NGROK_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || t("physioHome.fetchFail"));
      }

      const result = await response.json();
      if (result.status === "success" && result.data) {
        const profile = result.data;
        setPhysioData({
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
          setLicenseFileName(profile.license_file_name || t("physioHome.currentLicense"));
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError(err.message || t("physioHome.fetchFail"));
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
      },
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || t("physioHome.uploadFail"));
    }
    const data = await response.json();
    return data.file_id;
  };

  const handleSubmit = async () => {
    setIsUpdating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      let licenseFileId = null;
      if (licenseFile) {
        licenseFileId = await uploadFile(licenseFile);
      }

      const updateData = {
        full_name: physioData.full_name,
        email: physioData.email,
        phone: physioData.phone,
        available_time: physioData.available_time,
        session_fee: parseInt(physioData.session_fee) || 0,
        type: physioData.type,
      };

      if (physioData.password) {
        updateData.password = physioData.password;
      }

      if (licenseFileId) {
        updateData.license_file_id = licenseFileId;
      }

      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/provider/nurse/profile`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...NGROK_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || t("physioHome.updateFail"));
      }

      const result = await response.json();
      if (result.status === "success") {
        setSuccessMsg(t("physioHome.updateSuccess"));
        setPhysioData({ ...physioData, password: "" });
        if (licenseFile) {
          setLicenseFile(null);
        }
        setTimeout(() => {
          setSuccessMsg(null);
          fetchPhysioProfile();
        }, 2000);
      }
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || t("physioHome.updateFail"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePickLicenseFile = async () => {
    try {
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
    } catch (err) {
      console.error("Error picking license file:", err);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <PhysioHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{t("physioHome.title")}</Text>
            <Text style={styles.subtitle}>{t("physioHome.subtitle")}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.updateBtn,
              (isUpdating || isLoading) && styles.updateBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isUpdating || isLoading}
          >
            <Text style={styles.updateBtnText}>
              {isUpdating ? t("physioHome.updating") : t("physioHome.update")}
            </Text>
          </TouchableOpacity>
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
          <Text style={styles.centerText}>{t("physioHome.loading")}</Text>
        ) : (
          <View style={{ gap: 20 }}>
            <View style={styles.photoWrap}>
              <Image
                source={require("../../../assets/gallery-7.png")}
                style={styles.photo}
              />
            </View>

            <View>
              <Text style={styles.label}>{t("physioHome.fullName")}</Text>
              <View style={styles.inputRow}>
                <FontAwesome5 name="user" size={16} color={colors.cyan} />
                <TextInput
                  style={styles.input}
                  value={physioData.full_name}
                  onChangeText={(val) =>
                    setPhysioData({ ...physioData, full_name: val })
                  }
                  editable={false}
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>{t("physioHome.email")}</Text>
              <View style={styles.inputRow}>
                <FontAwesome5 name="envelope" size={16} color={colors.cyan} />
                <TextInput
                  style={styles.input}
                  keyboardType="email-address"
                  value={physioData.email}
                  onChangeText={(val) =>
                    setPhysioData({ ...physioData, email: val })
                  }
                  editable={false}
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>{t("physioHome.phone")}</Text>
              <View style={styles.inputRow}>
                <FontAwesome5 name="phone" size={16} color={colors.cyan} />
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={physioData.phone}
                  onChangeText={(val) =>
                    setPhysioData({ ...physioData, phone: val })
                  }
                  editable={false}
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>{t("physioHome.password")}</Text>
              <View style={styles.inputRow}>
                <FontAwesome5 name="lock" size={16} color={colors.cyan} />
                <TextInput
                  style={styles.input}
                  secureTextEntry={!passwordShown}
                  value={physioData.password}
                  onChangeText={(val) =>
                    setPhysioData({ ...physioData, password: val })
                  }
                  placeholder={t("physioHome.passwordPlaceholder")}
                  editable={false}
                />
                <TouchableOpacity onPress={() => setPasswordShown(!passwordShown)}>
                  <FontAwesome5
                    name={passwordShown ? "eye-slash" : "eye"}
                    size={16}
                    color={colors.gray500}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text style={styles.label}>{t("physioHome.gender")}</Text>
              <View style={styles.inputRow}>
                <FontAwesome5 name="venus-mars" size={16} color={colors.cyan} />
                <Text style={styles.readonlyValue}>
                  {physioData.gender
                    ? physioData.gender.charAt(0).toUpperCase() +
                      physioData.gender.slice(1)
                    : t("physioHome.gender")}
                </Text>
              </View>
            </View>

            <View>
              <Text style={styles.label}>{t("physioHome.sessionFee")}</Text>
              <View style={styles.inputRow}>
                <FontAwesome5 name="hand-holding-usd" size={16} color={colors.cyan} />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(physioData.session_fee)}
                  onChangeText={(val) =>
                    setPhysioData({ ...physioData, session_fee: val })
                  }
                  editable={false}
                />
                <Text style={styles.readonlyValue}>$</Text>
              </View>
            </View>

            <View>
              <Text style={styles.label}>{t("physioHome.licenseFile")}</Text>
              <View style={styles.licenseRow}>
                <TouchableOpacity
                  style={styles.licensePicker}
                  onPress={handlePickLicenseFile}
                  disabled
                >
                  <FontAwesome5 name="file-upload" size={16} color={colors.cyan} />
                  <Text style={styles.licenseFileName}>
                    {licenseFileName || t("physioHome.viewFile")}
                  </Text>
                </TouchableOpacity>

                {licenseFilePreview && !licenseFile && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(licenseFilePreview)}
                  >
                    <Text style={styles.viewCurrentText}>
                      {t("physioHome.viewCurrent")}
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

export default PhysioHomePage;

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: colors.gray50 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#0a3460" },
  subtitle: { color: colors.gray700, fontWeight: "500", marginTop: 8, fontSize: 15 },
  updateBtn: {
    backgroundColor: colors.darkBlue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  updateBtnDisabled: { opacity: 0.5 },
  updateBtnText: { color: colors.white, fontWeight: "600" },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#f87171",
    borderRadius: 6,
    padding: 12,
    marginBottom: 14,
  },
  errorText: { color: "#b91c1c" },
  successBox: {
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#4ade80",
    borderRadius: 6,
    padding: 12,
    marginBottom: 14,
  },
  successText: { color: "#15803d" },
  centerText: { textAlign: "center", color: colors.gray500, marginVertical: 20 },
  photoWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  photo: { width: "100%", height: "100%" },
  label: { fontSize: 13, fontWeight: "500", color: colors.gray700, marginBottom: 8 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: { flex: 1, color: colors.gray800 },
  readonlyValue: { color: colors.gray800, fontWeight: "500" },
  licenseRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  licensePicker: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  licenseFileName: { fontSize: 13, color: colors.gray700 },
  viewCurrentText: { fontSize: 13, color: colors.cyan, fontWeight: "500" },
});
