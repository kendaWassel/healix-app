import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Modal, Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../common/LanguageSwitcher";

const PatientHeader = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (screenName) => route.name === screenName;

const links = [
  { screen: "PatientHome", label: t("header.home"), icon: "home-outline" },
  { screen: "DoctorConsultation", label: t("header.consultation"), icon: "medkit-outline" },
  { screen: "MySchedules", label: t("header.schedules"), icon: "calendar-outline" },
  { screen: "Receipts", label: t("header.receipts"), icon: "receipt-outline" },
];

  const go = (screen) => {
    setMenuOpen(false);
    navigation.navigate(screen);
  };

  return (
    <View style={styles.nav}>
      <TouchableOpacity onPress={() => navigation.navigate("PatientHome")}>
        <Text style={styles.logo}>
          Heal<Text style={{ color: "#39CCCC" }}>ix</Text>
        </Text>
      </TouchableOpacity>

      <View style={styles.rightSection}>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.menuBtn}>
          <Ionicons name="menu" size={24} color="#052443" />
        </TouchableOpacity>

        <LanguageSwitcher />

        <View style={styles.badge}>
          <Ionicons name="person-circle" size={22} color="#39CCCC" />
          <Text style={styles.badgeText}>{t("header.patient")}</Text>
        </View>
      </View>

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

export default PatientHeader;

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
  logo: { fontSize: 22, fontWeight: "bold", color: "#052443" },
  rightSection: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuBtn: { padding: 4 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4 },
  badgeText: { fontWeight: "600", color: "#052443", fontSize: 13 },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.15)" },
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
  dropdownItemActive: { backgroundColor: "#ebfafa" },
  dropdownText: { fontSize: 14, color: "#374151", flex: 1 },
  dropdownTextActive: { color: "#39CCCC", fontWeight: "700" },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#39CCCC" },
});