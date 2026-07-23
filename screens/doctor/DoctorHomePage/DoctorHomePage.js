import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import DoctorHeader from "../../Components/header/DoctorHeader";
import Footer from "../../Components/footer/Footer";

const DoctorHomePage = () => {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
 const [doctorData, setDoctorData] = useState({
    full_name: "",
    email: "",
    phone: "",
    gender: "",
    specialization: "",
    from: "",
    to: "",
    consultation_fee: "",
    rating_avg: 0,
    image: null,
  });

  // 🔹 ملف الصورة الجديد المُختار (لم يُرفع بعد)، يُحمَل عند الضغط "Update" فقط
  const [newImageAsset, setNewImageAsset] = useState(null);

  const fetchDoctorProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        "https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/doctor/profile",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("Doctor profile:", data);

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || t("doctorHome.loadProfileFailed"));
      }

      const profile = data.data;
      setDoctorData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        gender: profile.gender || "",
        specialization: profile.specialization || "",
        from: profile.from || "",
        to: profile.to || "",
        consultation_fee: profile.consultation_fee ? String(profile.consultation_fee) : "",
        rating_avg: profile.rating_avg || 0,
        image: profile.image || null,
      });
    } catch (err) {
      console.error("Failed fetching doctor profile:", err);
      setError(err.message || t("doctorHome.loadProfileFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

 
  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(t("doctorHome.photoPermissionRequired"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled || !result.assets?.length) return;

    // تحويل لـ JPEG لضمان توافق mimes: jpeg,png,jpg,gif
    const manipulated = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    setNewImageAsset(manipulated);
    setDoctorData((prev) => ({ ...prev, image: manipulated.uri }));   // معاينة فورية محلية
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = await AsyncStorage.getItem("token");

      // 🔹 بما أن الباك اند يستقبل ملفات مباشرة، يجب استخدام FormData
      const formData = new FormData();
          formData.append("_method", "PUT");  
      formData.append("full_name", doctorData.full_name);
      formData.append("email", doctorData.email);
      formData.append("phone", doctorData.phone);
      formData.append("from", doctorData.from);
      formData.append("to", doctorData.to);
      formData.append("consultation_fee", doctorData.consultation_fee);

      if (newImageAsset) {
        formData.append("image", {
          uri: newImageAsset.uri,
          name: "profile.jpg",
          type: "image/jpeg",
        });
      }

      const response = await fetch(
        "https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/doctor/profile",
        {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
            // ⚠️ لا تضعي Content-Type يدوياً — fetch يحددها تلقائياً مع FormData (multipart/form-data + boundary)
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log("Update result:", data);

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || t("doctorHome.updateFailed"));
      }

      setSuccessMsg(t("doctorHome.updateSuccess"));
      setNewImageAsset(null);
      setTimeout(() => {
        setSuccessMsg(null);
        fetchDoctorProfile();
      }, 2000);
    } catch (err) {
      setError(err.message || t("doctorHome.updateFailed"));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <DoctorHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{t("doctorHome.title")}</Text>
            <Text style={styles.subtitle}>{t("doctorHome.subtitle")}</Text>
          </View>
          <TouchableOpacity
            style={[styles.updateBtn, (isUpdating || isLoading) && styles.updateBtnDisabled]}
            onPress={handleUpdate}
            disabled={isUpdating || isLoading}
          >
            {isUpdating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.updateBtnText}>{t("doctorHome.update")}</Text>
            )}
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorBox}>{error}</Text>}
        {successMsg && <Text style={styles.successBox}>{successMsg}</Text>}

        {isLoading ? (
          <Text style={styles.loadingText}>{t("doctorHome.loadingProfile")}</Text>
        ) : (
          <>
            {/* Photo + Rating + زر التعديل */}
            <View style={styles.photoRow}>
              <TouchableOpacity onPress={handlePickImage} style={styles.photoCircle}>
                <Image
                  source={{ uri: doctorData.image || undefined }}
                  defaultSource={require("../../../assets/gallery-7.png")}
                  style={styles.photoImage}
                />
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={14} color="#fff" />
                </View>
              </TouchableOpacity>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <TouchableOpacity onPress={handlePickImage}>
                  <Text style={styles.changePhotoText}>{t("doctorHome.changePhoto")}</Text>
                </TouchableOpacity>
                <View style={[styles.ratingBadge, { marginTop: 8, alignSelf: "flex-start" }]}>
                  <Ionicons name="star" size={16} color="#39CCCC" />
                  <Text style={styles.ratingText}>{doctorData.rating_avg}</Text>
                </View>
              </View>
            </View>

            {/* Full Name */}
            <Field
              label={t("doctorHome.fullName")}
              icon="person-outline"
              value={doctorData.full_name}
              onChangeText={(t2) => setDoctorData({ ...doctorData, full_name: t2 })}
            />

            {/* Email */}
            <Field
              label={t("doctorHome.email")}
              icon="mail-outline"
              value={doctorData.email}
              onChangeText={(t2) => setDoctorData({ ...doctorData, email: t2 })}
              keyboardType="email-address"
            />

            {/* Phone */}
            <Field
              label={t("doctorHome.phone")}
              icon="call-outline"
              value={doctorData.phone}
              onChangeText={(t2) => setDoctorData({ ...doctorData, phone: t2 })}
              keyboardType="phone-pad"
            />

            {/* Specialization — للعرض فقط، لا يوجد حقل تحديث له في الباك اند */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>{t("doctorHome.specialization")}</Text>
              <View style={styles.inputRow}>
                <Ionicons name="medkit-outline" size={20} color="#39CCCC" />
                <Text style={styles.selectText}>
                  {doctorData.specialization || t("doctorHome.specialization")}
                </Text>
              </View>
            </View>

            {/* Gender — للعرض فقط (اختياري تفعيله لاحقاً، الباك اند يدعمه) */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>{t("doctorHome.gender")}</Text>
              <View style={styles.inputRow}>
                <Ionicons name="body-outline" size={20} color="#39CCCC" />
                <Text style={styles.selectText}>
                  {doctorData.gender === "female" ? t("doctorHome.female") : t("doctorHome.male")}
                </Text>
              </View>
            </View>

            {/* Working hours: From */}
            <Field
              label={t("doctorHome.workingHoursFrom")}
              icon="time-outline"
              value={doctorData.from}
              onChangeText={(t2) => setDoctorData({ ...doctorData, from: t2 })}
              placeholder="--:--"
            />

            {/* Working hours: To */}
            <Field
              label={t("doctorHome.workingHoursTo")}
              icon="time-outline"
              value={doctorData.to}
              onChangeText={(t2) => setDoctorData({ ...doctorData, to: t2 })}
              placeholder="--:--"
            />

            {/* Consultation fee */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>{t("doctorHome.consultationFee")}</Text>
              <View style={styles.inputRow}>
                <Ionicons name="cash-outline" size={20} color="#39CCCC" />
                <TextInput
                  value={doctorData.consultation_fee}
                  onChangeText={(t2) => setDoctorData({ ...doctorData, consultation_fee: t2 })}
                  keyboardType="numeric"
                  placeholder={t("doctorHome.consultationFeePlaceholder")}
                  style={styles.input}
                />
                <Text style={styles.dollarSign}>$</Text>
              </View>
            </View>
          </>
        )}

        <Footer />
      </ScrollView>
    </View>
  );
};

const Field = ({ label, icon, value, placeholder, keyboardType, onChangeText }) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputRow}>
      <Ionicons name={icon} size={20} color="#39CCCC" />
      <TextInput
        value={value}
        placeholder={placeholder}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  </View>
);

export default DoctorHomePage;

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
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  photoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 45,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#39CCCC",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  changePhotoText: {
    color: "#39CCCC",
    fontWeight: "600",
    fontSize: 14,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ebfafa",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  ratingText: {
    color: "#052443",
    fontWeight: "600",
  },
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
  selectText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
  },
  dollarSign: {
    color: "#767676",
    fontWeight: "500",
  },
});