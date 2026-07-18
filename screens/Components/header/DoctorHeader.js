// components/headers/DoctorHeader.js
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const DoctorHeader = () => {
  const navigation = useNavigation();
  const route = useRoute();

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
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("DoctorSchedules")}>
          <Text
            style={isActive("DoctorSchedules") ? styles.activeLink : styles.link}
          >
            My Schedules
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.badge}>
        <Ionicons name="medkit" size={22} color="#39CCCC" />
        <Text style={styles.badgeText}>Doctor</Text>
      </View>
    </View>
  );
};

export default DoctorHeader;

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  logo: {
    width: 90,
    height: 32,
  },
  linksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  link: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 13,
  },
  activeLink: {
    color: "#39CCCC",
    fontWeight: "700",
    fontSize: 13,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeText: {
    color: "#052443",
    fontWeight: "500",
    fontSize: 13,
  },
});