import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const PatientHeader = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const isActive = (screenName) => route.name === screenName;

  return (
<View style={styles.nav}>
  <View style={styles.topRow}>
    <TouchableOpacity onPress={() => navigation.navigate("PatientHome")}>
      <Text style={styles.logo}>
        Heal<Text style={{ color: "#39CCCC" }}>ix</Text>
      </Text>
    </TouchableOpacity>

    <View style={styles.userBadge}>
      <Ionicons name="person-circle" size={22} color="#39CCCC" />
      <Text style={styles.userText}>Patient</Text>
    </View>
  </View>

      {/* أزرار التنقل السريع */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, isActive("DoctorConsultation") && styles.tabActive]}
          onPress={() => navigation.navigate("DoctorConsultation")}
        >
          <Ionicons
            name="medkit"
            size={18}
            color={isActive("DoctorConsultation") ? "#fff" : "#052443"}
          />
          <Text
            style={[
              styles.tabText,
              isActive("DoctorConsultation") && styles.tabTextActive,
            ]}
          >
            Consultation
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate("MySchedules")}
        >
          <Ionicons name="calendar" size={18} color="#767676" />
          <Text style={styles.tabTextInactive}>Schedules</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate("Receipts")}
        >
          <Ionicons name="receipt" size={18} color="#767676" />
          <Text style={styles.tabTextInactive}>Receipts</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PatientHeader;

const styles = StyleSheet.create({
  nav: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingTop: Platform.OS === "ios" ? 50 : 35,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  logo: { fontSize: 22, fontWeight: "bold", color: "#052443" },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  userText: { fontWeight: "600", color: "#052443", fontSize: 13 },

  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 14,
    gap: 6,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  tabActive: { backgroundColor: "#052443", borderColor: "#052443" },
  tabText: { fontSize: 12, fontWeight: "600", color: "#052443" },
  tabTextActive: { color: "#fff" },
  tabTextInactive: { fontSize: 12, fontWeight: "500", color: "#767676" },
});