import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import PharmacistHeader from "../../Components/header/PharmacistHeader";
import Footer from "../../Components/footer/Footer";

const PharmacistHomePage = () => {
  const { t } = useTranslation();
  const [passwordShown, setPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [pharmacistData, setPharmacistData] = useState({
    full_name: "",
    email: "",
    phone: "",
    pharmacy_name: "",
    cr_number: "",
    address: "",
    latitude: null,
    longitude: null,
    from: "",
    to: "",
    license_file: null,
    rating_avg: 0,
  });

  const [newLicenseFile, setNewLicenseFile] = useState(null);

  const fetchPharmacistProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        "https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/pharmacist/profile",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept : "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("Pharmacist profile:", data);

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || t("pharmacistHomePage.loadProfileFailed"));
      }

      const profile = data.data;
      setPharmacistData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        pharmacy_name: profile.pharmacy_name || "",
        cr_number: profile.cr_number || "",
        address: profile.address || "",
        latitude: profile.latitude,
        longitude: profile.longitude,
        from: profile.from || "",
        to: profile.to || "",
        license_file: profile.license_file || null,
        rating_avg: profile.rating_avg || 0,
      });
    } catch (err) {
      console.error("Failed fetching pharmacist profile:", err);
      setError(err.message || t("pharmacistHomePage.loadProfileFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacistProfile();
  }, []);

  // 🔹 اختيار ملف الترخيص الجديد (PDF أو صورة)
  const handlePickLicenseFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/jpeg", "image/png"],
    });

    if (result.canceled || !result.assets?.length) return;

    setNewLicenseFile(result.assets[0]);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = await AsyncStorage.getItem("token");

      // 🔹 نفس حل _method Spoofing المطبَّق في DoctorHomePage
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("full_name", pharmacistData.full_name);
      formData.append("phone", pharmacistData.phone);
      formData.append("pharmacy_name", pharmacistData.pharmacy_name);
      formData.append("address", pharmacistData.address);
      formData.append("from", pharmacistData.from);
      formData.append("to", pharmacistData.to);

      if (pharmacistData.latitude != null) {
        formData.append("latitude", String(pharmacistData.latitude));
      }
      if (pharmacistData.longitude != null) {
        formData.append("longitude", String(pharmacistData.longitude));
      }

      if (newLicenseFile) {
        formData.append("license_file", {
          uri: newLicenseFile.uri,
          name: newLicenseFile.name,
          type: newLicenseFile.mimeType || "application/pdf",
        });
      }

      const response = await fetch(
        "https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/pharmacist/profile",
        {
          method: "POST",
          headers: {
                   Accept : "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log("Update result:", data);

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || t("pharmacistHomePage.updateFailed"));
      }

      setSuccessMsg(t("pharmacistHomePage.updateSuccess"));
      setNewLicenseFile(null);
      setTimeout(() => {
        setSuccessMsg(null);
        fetchPharmacistProfile();
      }, 2000);
    } catch (err) {
      setError(err.message || t("pharmacistHomePage.updateFailed"));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <PharmacistHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{t("pharmacistHomePage.accountInfo")}</Text>
            <Text style={styles.subtitle}>{t("pharmacistHomePage.viewOrUpdate")}</Text>
          </View>
          <TouchableOpacity
            style={[styles.updateBtn, (isUpdating || isLoading) && styles.updateBtnDisabled]}
            onPress={handleUpdate}
            disabled={isUpdating || isLoading}
          >
            {isUpdating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.updateBtnText}>{t("pharmacistHomePage.update")}</Text>
            )}
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorBox}>{error}</Text>}
        {successMsg && <Text style={styles.successBox}>{successMsg}</Text>}

        {isLoading ? (
          <Text style={styles.loadingText}>{t("pharmacistHomePage.loadingProfile")}</Text>
        ) : (
          <>
            {/* Full Name */}
            <Field
              label={t("pharmacistHomePage.fullName")}
              icon="person-outline"
              value={pharmacistData.full_name}
              onChangeText={(t2) => setPharmacistData({ ...pharmacistData, full_name: t2 })}
            />

            {/* Email — للعرض فقط، غير قابل للتحديث من الباك اند */}
            <Field
              label={t("pharmacistHomePage.email")}
              icon="mail-outline"
              value={pharmacistData.email}
              keyboardType="email-address"
              editable={false}
            />

            {/* Phone */}
            <Field
              label={t("pharmacistHomePage.phone")}
              icon="call-outline"
              value={pharmacistData.phone}
              onChangeText={(t2) => setPharmacistData({ ...pharmacistData, phone: t2 })}
              keyboardType="phone-pad"
            />

            {/* Pharmacy Name */}
            <Field
              label={t("pharmacistHomePage.pharmacyName")}
              icon="business-outline"
              value={pharmacistData.pharmacy_name}
              onChangeText={(t2) => setPharmacistData({ ...pharmacistData, pharmacy_name: t2 })}
            />

            {/* CR Number — للعرض فقط، غير قابل للتحديث من الباك اند */}
            <Field
              label={t("pharmacistHomePage.crNumber")}
              icon="ribbon-outline"
              value={pharmacistData.cr_number}
              keyboardType="numeric"
              editable={false}
            />

            {/* Address */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>{t("pharmacistHomePage.address")}</Text>
              <View style={styles.inputRow}>
                <Ionicons name="location-outline" size={20} color="#39CCCC" />
                <TextInput
                  placeholder={t("pharmacistHomePage.addressPlaceholder")}
                  value={pharmacistData.address}
                  onChangeText={(t2) => setPharmacistData({ ...pharmacistData, address: t2 })}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Working hours: From */}
            <Field
              label={t("pharmacistHomePage.workingHoursFrom")}
              icon="time-outline"
              value={pharmacistData.from}
              onChangeText={(t2) => setPharmacistData({ ...pharmacistData, from: t2 })}
              placeholder="--:--"
            />

            {/* Working hours: To */}
            <Field
              label={t("pharmacistHomePage.workingHoursTo")}
              icon="time-outline"
              value={pharmacistData.to}
              onChangeText={(t2) => setPharmacistData({ ...pharmacistData, to: t2 })}
              placeholder="--:--"
            />

            {/* Medical/License certificate */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>{t("pharmacistHomePage.medicalCertificateFile")}</Text>
              <TouchableOpacity onPress={handlePickLicenseFile} style={styles.fileRow}>
                <Ionicons name="document-outline" size={20} color="#39CCCC" />
                <Text style={styles.fileText}>
                  {newLicenseFile?.name || t("pharmacistHomePage.viewFile")}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Footer />
      </ScrollView>
    </View>
  );
};

const Field = ({ label, icon, value, placeholder, keyboardType, onChangeText, editable = true }) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputRow}>
      <Ionicons name={icon} size={20} color="#39CCCC" />
      <TextInput
        value={value}
        editable={editable}
        placeholder={placeholder}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  </View>
);

export default PharmacistHomePage;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#052443",
  },
  subtitle: {
    fontSize: 14,
    color: "#767676",
    marginTop: 6,
    fontWeight: "500",
  },
  updateBtn: {
    backgroundColor: "#052443",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  updateBtnDisabled: { opacity: 0.5 },
  updateBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  errorBox: {
    backgroundColor: "#fee2e2", borderWidth: 1, borderColor: "#fca5a5",
    color: "#b91c1c", padding: 10, borderRadius: 8, marginBottom: 12,
  },
  successBox: {
    backgroundColor: "#dcfce7", borderWidth: 1, borderColor: "#86efac",
    color: "#15803d", padding: 10, borderRadius: 8, marginBottom: 12,
  },
  loadingText: { textAlign: "center", color: "#888", paddingVertical: 20 },
  fieldWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  fileText: {
    fontSize: 14,
    color: "#767676",
  },
});