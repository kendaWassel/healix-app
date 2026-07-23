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
import { useTranslation } from "react-i18next";
import PharmacistHeader from "../../Components/header/PharmacistHeader";
import Footer from "../../Components/footer/Footer";

const PharmacistHomePage = () => {
  const { t } = useTranslation();
  const [passwordShown, setPasswordShown] = useState(false);

  const [physioData] = useState({
    full_name: "kenda wassel",
    email: "kendawassel14@gmail.com",
    phone: "0943779128",
    password: "123456",
    pharmacy_name: "Al Shefaa",
    cr_number: "123123",
    working_hours_from: "",
    working_hours_to: "",
  });

  const [licenseFileName] = useState("");

  return (
    <View style={{ flex: 1 }}>
      <PharmacistHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{t("pharmacistHomePage.accountInfo")}</Text>
            <Text style={styles.subtitle}>{t("pharmacistHomePage.viewOrUpdate")}</Text>
          </View>
          <TouchableOpacity style={styles.updateBtn} disabled>
            <Text style={styles.updateBtnText}>{t("pharmacistHomePage.update")}</Text>
          </TouchableOpacity>
        </View>

        {/* Full Name */}
        <Field
          label={t("pharmacistHomePage.fullName")}
          icon="person-outline"
          value={physioData.full_name}
        />

        {/* Email */}
        <Field
          label={t("pharmacistHomePage.email")}
          icon="mail-outline"
          value={physioData.email}
          keyboardType="email-address"
        />

        {/* Phone */}
        <Field
          label={t("pharmacistHomePage.phone")}
          icon="call-outline"
          value={physioData.phone}
          keyboardType="phone-pad"
        />

        {/* Password */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>{t("pharmacistHomePage.passwordLabel")}</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={20} color="#39CCCC" />
            <TextInput
              value={physioData.password}
              secureTextEntry={!passwordShown}
              editable={false}
              placeholder={t("pharmacistHomePage.passwordPlaceholder")}
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
        {/* Pharmacy Name */}
        <Field
          label={t("pharmacistHomePage.pharmacyName")}
          icon="business-outline"
          value={physioData.pharmacy_name}
        />

        {/* CR Number */}
        <Field
          label={t("pharmacistHomePage.crNumber")}
          icon="ribbon-outline"
          value={physioData.cr_number}
          keyboardType="numeric"
        />

        {/* Address */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>{t("pharmacistHomePage.address")}</Text>
          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={20} color="#39CCCC" />
            <TextInput
              placeholder={t("pharmacistHomePage.addressPlaceholder")}
              editable={false}
              style={styles.input}
            />
          </View>
        </View>

        {/* Location in map */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>{t("pharmacistHomePage.locationInMap")}</Text>
          <TouchableOpacity style={styles.fileRow} disabled>
            <Ionicons name="map-outline" size={20} color="#39CCCC" />
            <Text style={styles.fileText}>{t("pharmacistHomePage.locationInMap")}</Text>
          </TouchableOpacity>
        </View>

        {/* Working hours: From */}
        <Field
          label={t("pharmacistHomePage.workingHoursFrom")}
          icon="time-outline"
          value={physioData.working_hours_from}
          placeholder="--:--"
        />

        {/* Working hours: To */}
        <Field
          label={t("pharmacistHomePage.workingHoursTo")}
          icon="time-outline"
          value={physioData.working_hours_to}
          placeholder="--:--"
        />

        {/* Medical certificate */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>{t("pharmacistHomePage.medicalCertificateFile")}</Text>
          <TouchableOpacity style={styles.fileRow} disabled>
            <Ionicons name="document-outline" size={20} color="#39CCCC" />
            <Text style={styles.fileText}>
              {licenseFileName || t("pharmacistHomePage.viewFile")}
            </Text>
          </TouchableOpacity>
        </View>

        <Footer />
      </ScrollView>
    </View>
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
    opacity: 0.6,
  },
  fileText: {
    fontSize: 14,
    color: "#767676",
  },
});

export default PharmacistHomePage;