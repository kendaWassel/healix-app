// screens/doctor/DoctorHomePage.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DoctorHeader from "../../Components/header/DoctorHeader";
import Footer from "../../Components/footer/Footer";
import { SafeAreaView } from "react-native-safe-area-context";

const DoctorHomePage = () => {
  const [passwordShown, setPasswordShown] = useState(false);


  const [physioData] = useState({
    full_name: "kenda wassel",
    email: "kendawassel14@gmail.com",
    phone: "0943779128",
    password: "123456",
    available_time_from: "",
    available_time_to: "",
    session_fee: "100",
    specialization: "",
    gender: "female",
    rating: 3,
  });

  const [licenseFileName] = useState("");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <DoctorHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Account Information</Text>
            <Text style={styles.subtitle}>View or update your information</Text>
          </View>
          <TouchableOpacity style={styles.updateBtn} disabled>
            <Text style={styles.updateBtnText}>Update</Text>
          </TouchableOpacity>
        </View>

        {/* Photo + Rating */}
        <View style={styles.photoRow}>
          <View style={styles.photoCircle}>
            <Image
              source={require("../../../assets/gallery-7.png")}
              style={styles.photoImage}
            />
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={16} color="#39CCCC" />
            <Text style={styles.ratingText}>{physioData.rating}</Text>
          </View>
        </View>

        {/* Full Name */}
        <Field
          label="Full Name"
          icon="person-outline"
          value={physioData.full_name}
        />

        {/* Email */}
        <Field
          label="Email"
          icon="mail-outline"
          value={physioData.email}
          keyboardType="email-address"
        />

        {/* Phone */}
        <Field
          label="Phone Number"
          icon="call-outline"
          value={physioData.phone}
          keyboardType="phone-pad"
        />

        {/* Password */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={20} color="#39CCCC" />
            <TextInput
              value={physioData.password}
              secureTextEntry={!passwordShown}
              editable={false}
              placeholder="Leave empty to keep current password"
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setPasswordShown(!passwordShown)}>
              <Ionicons
                name={passwordShown ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#767676"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Specialization */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Specialization</Text>
          <View style={styles.inputRow}>
            <Ionicons name="medkit-outline" size={20} color="#39CCCC" />
            <Text style={styles.selectText}>
              {physioData.specialization || "Specialization"}
            </Text>
          </View>
        </View>

        {/* Gender */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.inputRow}>
            <Ionicons name="body-outline" size={20} color="#39CCCC" />
            <Text style={styles.selectText}>
              {physioData.gender === "female" ? "Female" : "Male"}
            </Text>
          </View>
        </View>

        {/* Working hours: From */}
        <Field
          label="Working hours: From"
          icon="time-outline"
          value={physioData.available_time_from}
          placeholder="--:--"
        />

        {/* Working hours: To */}
        <Field
          label="Working hours: To"
          icon="time-outline"
          value={physioData.available_time_to}
          placeholder="--:--"
        />

        {/* Consultation fee */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Consultation fee</Text>
          <View style={styles.inputRow}>
            <Ionicons name="cash-outline" size={20} color="#39CCCC" />
            <TextInput
              value={physioData.session_fee}
              editable={false}
              keyboardType="numeric"
              placeholder="Consultation fee..."
              style={styles.input}
            />
            <Text style={styles.dollarSign}>$</Text>
          </View>
        </View>

        {/* Medical certificate */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Medical certificate File</Text>
          <TouchableOpacity style={styles.fileRow} disabled>
            <Ionicons name="document-outline" size={20} color="#39CCCC" />
            <Text style={styles.fileText}>
              {licenseFileName || "View File"}
            </Text>
          </TouchableOpacity>
        </View>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
};

// مكوّن حقل بسيط قابل لإعادة الاستخدام
const Field = ({ label, icon, value, placeholder, keyboardType }) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputRow}>
      <Ionicons name={icon} size={20} color="#39CCCC" />
      <TextInput
        value={value}
        editable={false}
        placeholder={placeholder}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  </View>
);

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
    opacity: 0.5,
  },
  updateBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
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
    overflow: "hidden",
    marginRight: 12,
  },
  photoImage: {
    width: "100%",
    height: "100%",
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
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    opacity: 0.6,
  },
  fileText: {
    fontSize: 14,
    color: "#767676",
  },
});

export default DoctorHomePage;