// components/headers/DoctorHeader.js
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../common/LanguageSwitcher";

const DoctorHeader = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  const isActive = (screenName) => route.name === screenName;

  return (
    <View style={styles.nav}>
      <TouchableOpacity onPress={() => navigation.navigate("DoctorHome")}>
        <Image
          source={require("../../../assets/Logo-dark.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={styles.linksRow}>
        <TouchableOpacity onPress={() => navigation.navigate("DoctorHome")}>
          <Text style={isActive("DoctorHome") ? styles.activeLink : styles.link}>
            {t("header.home")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("DoctorSchedules")}>
          <Text
            style={isActive("DoctorSchedules") ? styles.activeLink : styles.link}
          >
            {t("header.mySchedules")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rightSection}>
        <LanguageSwitcher />
        <View style={styles.badge}>
          <Ionicons name="medkit" size={22} color="#39CCCC" />
          <Text style={styles.badgeText}>{t("header.doctor")}</Text>
        </View>
      </View>
    </View>
  );
};

export default DoctorHeader;

const styles = StyleSheet.create({
  nav: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingTop: Platform.OS === "ios" ? 66 : 35,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  logo: {
    width: 90,
    height: 32,
  },
  linksRow: {
    flexDirection: "row",
    gap: 20,
  },
  link: {
    color: "#767676",
    fontWeight: "500",
    fontSize: 14,
  },
  activeLink: {
    color: "#39CCCC",
    fontWeight: "700",
    fontSize: 14,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeText: {
    fontWeight: "600",
    color: "#052443",
    fontSize: 13,
  },
});