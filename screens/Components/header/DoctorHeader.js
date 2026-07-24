// components/headers/DoctorHeader.js
import React, { useState } from "react";
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Platform, Modal, Pressable,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../common/LanguageSwitcher";

const DoctorHeader = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (screenName) => route.name === screenName;

  const links = [
    { screen: "DoctorHome", label: t("header.home"), icon: "home-outline" },
    { screen: "DoctorSchedules", label: t("header.mySchedules"), icon: "calendar-outline" },
  ];

  const go = (screen) => {
    setMenuOpen(false);
    navigation.navigate(screen);
  };

  return (
    <View style={styles.nav}>
      {/* الشعار */}
      <TouchableOpacity onPress={() => navigation.navigate("DoctorHome")}>
        <Image
          source={require("../../../assets/Logo-dark.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* الجانب الأيمن: زر القائمة + اللغة + الشارة */}
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.menuBtn}>
          <Ionicons name="menu" size={24} color="#052443" />
        </TouchableOpacity>

        <LanguageSwitcher />

        <View style={styles.badge}>
          <Ionicons name="medkit" size={22} color="#39CCCC" />
          <Text style={styles.badgeText}>{t("header.doctor")}</Text>
        </View>
      </View>

      {/* القائمة المنسدلة */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={styles.dropdown}>
            {links.map((link) => {
              const active = isActive(link.screen);
              return (
                <TouchableOpacity
                  key={link.screen}
                  onPress={() => go(link.screen)}
                  style={[styles.dropdownItem, active && styles.dropdownItemActive]}
                >
                  <Ionicons
                    name={link.icon}
                    size={18}
                    color={active ? "#39CCCC" : "#767676"}
                  />
                  <Text style={[styles.dropdownText, active && styles.dropdownTextActive]}>
                    {link.label}
                  </Text>
                  {active && <View style={styles.activeDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
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
  },
  logo: { width: 90, height: 32 },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuBtn: {
    padding: 4,
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

  /* ---- القائمة المنسدلة ---- */
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  dropdown: {
    position: "absolute",
    top: Platform.OS === "ios" ? 108 : 78,
    right: 20,
    minWidth: 180,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemActive: {
    backgroundColor: "#ebfafa",
  },
  dropdownText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  dropdownTextActive: {
    color: "#39CCCC",
    fontWeight: "700",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#39CCCC",
  },
});