// screens/delivery/Components/header/DeliveryHeader.js

import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Pressable,
  ActivityIndicator,
  I18nManager,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "../common/LanguageSwitcher";
import { performLogout } from "../../../utils/logOut";

const DeliveryHeader = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (screenName) => route.name === screenName;

  const links = [
    {
      screen: "DeliveryHome",
      label: t("header.home"),
      icon: "home-outline",
    },
    {
      screen: "NewOrders",
      label: t("header.newOrders"),
      icon: "cart-outline",
    },
    {
      screen: "MyOrders",
      label: t("header.myOrders"),
      icon: "receipt-outline",
    },
  ];

  const go = (screen) => {
    setMenuOpen(false);
    navigation.navigate(screen);
  };

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await performLogout(navigation);
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <View style={styles.nav}>

      {/* ================= LOGO ================= */}
      <TouchableOpacity onPress={() => go("DeliveryHome")}>
        <Image
          source={require("../../../assets/Logo-dark.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* ================= RIGHT SECTION ================= */}
      <View style={styles.rightSection}>

        {/* Menu Button */}
        <TouchableOpacity
          onPress={() => setMenuOpen(true)}
          style={styles.menuBtn}
          hitSlop={10}
        >
          <Ionicons
            name="menu"
            size={24}
            color="#052443"
          />
        </TouchableOpacity>

        {/* Language */}
        <LanguageSwitcher />

        {/* Delivery Badge */}
        <View style={styles.badge}>
          <FontAwesome5
            name="truck"
            size={22}
            color="#39CCCC"
          />

          <Text style={styles.badgeText}>
            {t("header.delivery")}
          </Text>
        </View>

      </View>

      {/* ================= DROPDOWN MENU ================= */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setMenuOpen(false)}
        >

          <View style={styles.dropdown}>

            {/* Navigation Links */}
            {links.map((link) => {
              const active = isActive(link.screen);

              return (
                <TouchableOpacity
                  key={link.screen}
                  onPress={() => go(link.screen)}
                  style={[
                    styles.dropdownItem,
                    active && styles.dropdownItemActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={link.icon}
                    size={18}
                    color={active ? "#39CCCC" : "#767676"}
                  />

                  <Text
                    style={[
                      styles.dropdownText,
                      active && styles.dropdownTextActive,
                    ]}
                  >
                    {link.label}
                  </Text>

                  {active && (
                    <View style={styles.activeDot} />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Logout */}
            <TouchableOpacity
              onPress={() => {
                setMenuOpen(false);
                setShowLogoutConfirm(true);
              }}
              style={styles.dropdownItem}
              activeOpacity={0.7}
            >
              <Ionicons
                name="log-out-outline"
                size={18}
                color="#dc2626"
              />

              <Text style={styles.logoutText}>
                {t("logout.menuItem")}
              </Text>
            </TouchableOpacity>

          </View>

        </Pressable>
      </Modal>

      {/* ================= LOGOUT CONFIRMATION ================= */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!loggingOut) {
            setShowLogoutConfirm(false);
          }
        }}
      >
        <View style={styles.confirmOverlay}>

          <View style={styles.confirmCard}>

            <Text style={styles.confirmTitle}>
              {t("logout.confirmTitle")}
            </Text>

            <Text style={styles.confirmMessage}>
              {t("logout.confirmMessage")}
            </Text>

            <View
              style={[
                styles.confirmButtonsRow,
                I18nManager.isRTL &&
                  styles.confirmButtonsRowRTL,
              ]}
            >

              {/* Cancel */}
              <TouchableOpacity
                onPress={() => setShowLogoutConfirm(false)}
                style={styles.confirmCancelBtn}
                disabled={loggingOut}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmCancelText}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>

              {/* Logout */}
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.confirmLogoutBtn}
                disabled={loggingOut}
                activeOpacity={0.7}
              >
                {loggingOut ? (
                  <ActivityIndicator
                    color="#fff"
                    size="small"
                  />
                ) : (
                  <Text style={styles.confirmLogoutText}>
                    {t("logout.menuItem")}
                  </Text>
                )}
              </TouchableOpacity>

            </View>

          </View>

        </View>
      </Modal>

    </View>
  );
};

export default DeliveryHeader;

const styles = StyleSheet.create({

  /* =====================================================
     HEADER
  ===================================================== */

  nav: {
    backgroundColor: "#fff",

    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",

    paddingTop: Platform.OS === "ios" ? 66 : 35,

    paddingHorizontal: 20,
    paddingBottom: 10,

    flexDirection: I18nManager.isRTL
      ? "row-reverse"
      : "row",

    alignItems: "center",
    justifyContent: "space-between",

    position: "relative",

    zIndex: 10,
  },

  /* =====================================================
     LOGO
  ===================================================== */

  logo: {
    width: 90,
    height: 32,
  },

  /* =====================================================
     RIGHT SECTION
  ===================================================== */

  rightSection: {
    flexDirection: I18nManager.isRTL
      ? "row-reverse"
      : "row",

    alignItems: "center",

    gap: 10,
  },

  menuBtn: {
    padding: 4,
  },

  /* =====================================================
     DELIVERY BADGE
  ===================================================== */

  badge: {
    flexDirection: I18nManager.isRTL
      ? "row-reverse"
      : "row",

    alignItems: "center",

    gap: 4,
  },

  badgeText: {
    fontWeight: "600",
    color: "#052443",
    fontSize: 13,
  },

  /* =====================================================
     MODAL BACKDROP
  ===================================================== */

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
  },

  /* =====================================================
     DROPDOWN
  ===================================================== */

  dropdown: {
    position: "absolute",

    top: Platform.OS === "ios"
      ? 108
      : 78,

    right: 20,

    minWidth: 200,

    backgroundColor: "#fff",

    borderRadius: 12,

    paddingVertical: 6,

    borderWidth: 1,
    borderColor: "#e5e7eb",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.12,

    shadowRadius: 12,

    elevation: 8,
  },

  /* =====================================================
     DROPDOWN ITEM
  ===================================================== */

  dropdownItem: {
    flexDirection: I18nManager.isRTL
      ? "row-reverse"
      : "row",

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

    textAlign: I18nManager.isRTL
      ? "right"
      : "left",
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

  /* =====================================================
     DIVIDER
  ===================================================== */

  divider: {
    height: 1,

    backgroundColor: "#f3f4f6",

    marginVertical: 4,
  },

  /* =====================================================
     LOGOUT
  ===================================================== */

  logoutText: {
    fontSize: 14,

    color: "#dc2626",

    fontWeight: "600",

    flex: 1,

    textAlign: I18nManager.isRTL
      ? "right"
      : "left",
  },

  /* =====================================================
     LOGOUT CONFIRM MODAL
  ===================================================== */

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

    lineHeight: 20,
  },

  confirmButtonsRow: {
    flexDirection: "row",

    gap: 12,
  },

  confirmButtonsRowRTL: {
    flexDirection: "row-reverse",
  },

  /* =====================================================
     CANCEL BUTTON
  ===================================================== */

  confirmCancelBtn: {
    flex: 1,

    borderWidth: 1,

    borderColor: "#d1d5db",

    borderRadius: 10,

    paddingVertical: 12,

    alignItems: "center",

    justifyContent: "center",
  },

  confirmCancelText: {
    color: "#374151",

    fontWeight: "600",
  },

  /* =====================================================
     LOGOUT BUTTON
  ===================================================== */

  confirmLogoutBtn: {
    flex: 1,

    backgroundColor: "#dc2626",

    borderRadius: 10,

    paddingVertical: 12,

    alignItems: "center",

    justifyContent: "center",
  },

  confirmLogoutText: {
    color: "#fff",

    fontWeight: "600",
  },

});