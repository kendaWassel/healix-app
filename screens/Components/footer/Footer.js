import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Footer = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.logo}>
        Heal<Text style={{ color: "#39CCCC" }}>ix</Text>
      </Text>
      <Text style={styles.tagline}>Your health, our priority</Text>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBtn}>
          <Ionicons name="logo-facebook" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Ionicons name="logo-instagram" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Ionicons name="logo-twitter" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />
      <Text style={styles.copyright}>
        © 2026 Healix. All rights reserved.
      </Text>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#052443",
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: "center",
    marginHorizontal: -20,
  },
  logo: { fontSize: 33, fontWeight: "bold", color: "#fff" },
  tagline: { fontSize: 13, color: "#9fb3c8", marginTop: 6, marginBottom: 16 },
  socialRow: { flexDirection: "row", gap: 14, marginBottom: 20 },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 16,
  },
  copyright: { fontSize: 12, color: "#9fb3c8", textAlign: "center" },
});