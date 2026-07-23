// screens/pharmacist/Components/header/PharmacistHeader.js
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../common/LanguageSwitcher";

const PharmacistHeader = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  const isActive = (screenName) => route.name === screenName;

  return (
    <View style={styles.nav}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.navigate("PharmacistHome")}>
          <Image
            source={require("../../../assets/Logo-dark.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.rightSection}>
          <LanguageSwitcher />
          <View style={styles.badge}>
            <Ionicons name="medical" size={20} color="#39CCCC" />
            <Text style={styles.badgeText}>{t("header.pharmacist")}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, isActive("PharmacistHome") && styles.tabActive]}
          onPress={() => navigation.navigate("PharmacistHome")}
        >
          <Ionicons
            name="home"
            size={16}
            color={isActive("PharmacistHome") ? "#39CCCC" : "#767676"}
          />
          <Text
            style={[
              styles.tabTextInactive,
              isActive("PharmacistHome") && styles.tabTextActive,
            ]}
          >
            {t("header.home")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, isActive("MyOrders") && styles.tabActive]}
          onPress={() => navigation.navigate("MyOrders")}
        >
          <Ionicons
            name="receipt"
            size={16}
            color={isActive("MyOrders") ? "#39CCCC" : "#767676"}
          />
          <Text
            style={[
              styles.tabTextInactive,
              isActive("MyOrders") && styles.tabTextActive,
            ]}
          >
            {t("header.myOrders")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, isActive("NewOrders") && styles.tabActive]}
          onPress={() => navigation.navigate("NewOrders")}
        >
          <Ionicons
            name="cart"
            size={16}
            color={isActive("NewOrders") ? "#39CCCC" : "#767676"}
          />
          <Text
            style={[
              styles.tabTextInactive,
              isActive("NewOrders") && styles.tabTextActive,
            ]}
          >
            {t("header.newOrders")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PharmacistHeader;

const styles = StyleSheet.create({
  nav: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 35,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  logo: {
    width: 90,
    height: 32,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tabBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tabActive: {
    backgroundColor: "#ebfafa",
  },
  tabTextInactive: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 13,
  },
  tabTextActive: {
    color: "#39CCCC",
    fontWeight: "700",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeText: {
    color: "#052443",
    fontWeight: "500",
    fontSize: 13,
  },
});