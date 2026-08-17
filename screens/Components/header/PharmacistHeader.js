// screens/pharmacist/Components/header/PharmacistHeader.js
import React, { useState } from "react";
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Platform, Modal, Pressable, ActivityIndicator
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { performLogout } from "../../../utils/logOut";  
import NotificationBell from "../notifications/NotificationBell"; 

const PharmacistHeader = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (screenName) => route.name === screenName;

  const links = [
    { screen: "PharmacistHome", label: t("header.home"), icon: "home-outline" },
    { screen: "MyOrders", label: t("header.myOrders"), icon: "receipt-outline" },
    { screen: "NewOrders", label: t("header.newOrders"), icon: "cart-outline" },
  ];

  const go = (screen) => {
    setMenuOpen(false);
    navigation.navigate(screen);
  };

  const handleLogout = async () => {
  setLoggingOut(true);
  await performLogout(navigation);

};


  return (
    <View style={styles.nav}>
      {/* الشعار */}
      <TouchableOpacity onPress={() => navigation.navigate("PharmacistHome")}>
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
         <NotificationBell /> 
         
        <View style={styles.badge}>
          <Ionicons name="medical" size={22} color="#39CCCC" />
          <Text style={styles.badgeText}>{t("header.pharmacist")}</Text>
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

              <View style={styles.divider} />
          <TouchableOpacity
            onPress={() => {
              setMenuOpen(false);
              setShowLogoutConfirm(true);
            }}
            style={styles.dropdownItem}
          >
            <Ionicons name="log-out-outline" size={18} color="#dc2626" />
            <Text style={styles.logoutText}>{t("logout.menuItem")}</Text>
          </TouchableOpacity>

          </View>
        </Pressable>
    </Modal>
    
     <Modal
  visible={showLogoutConfirm}
  transparent
  animationType="fade"
  onRequestClose={() => setShowLogoutConfirm(false)}
>
  <View style={styles.confirmOverlay}>
    <View style={styles.confirmCard}>
      <Text style={styles.confirmTitle}>{t("logout.confirmTitle")}</Text>
      <Text style={styles.confirmMessage}>{t("logout.confirmMessage")}</Text>

      <View style={styles.confirmButtonsRow}>
        <TouchableOpacity
          onPress={() => setShowLogoutConfirm(false)}
          style={styles.confirmCancelBtn}
          disabled={loggingOut}
        >
          <Text style={styles.confirmCancelText}>{t("common.cancel")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          style={styles.confirmLogoutBtn}
          disabled={loggingOut}
        >
          {loggingOut ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.confirmLogoutText}>{t("logout.menuItem")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
       </View>
   </Modal>

    </View>
  );
};

export default PharmacistHeader;

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
  divider: {
  height: 1,
  backgroundColor: "#f3f4f6",
  marginVertical: 4,
},
logoutText: {
  fontSize: 14,
  color: "#dc2626",
  fontWeight: "600",
},
confirmOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
},
confirmCard: {
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 24,
  width: "85%",
  maxWidth: 360,
},
confirmTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: "#052443",
  textAlign: "center",
  marginBottom: 8,
},
confirmMessage: {
  fontSize: 14,
  color: "#767676",
  textAlign: "center",
  marginBottom: 20,
},
confirmButtonsRow: {
  flexDirection: "row",
  gap: 12,
},
confirmCancelBtn: {
  flex: 1,
  borderWidth: 1,
  borderColor: "#d1d5db",
  borderRadius: 10,
  paddingVertical: 12,
  alignItems: "center",
},
confirmCancelText: {
  color: "#374151",
  fontWeight: "600",
},
confirmLogoutBtn: {
  flex: 1,
  backgroundColor: "#dc2626",
  borderRadius: 10,
  paddingVertical: 12,
  alignItems: "center",
},
confirmLogoutText: {
  color: "#fff",
  fontWeight: "600",
},
});