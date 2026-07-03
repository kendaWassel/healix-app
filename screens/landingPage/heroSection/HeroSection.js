import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function HeroSection() {
  const navigation = useNavigation();
  return (
    <View style={styles.hero}>
      <Text style={styles.heroTitle}>Your Health, Just One Click Away</Text>
      <Text style={styles.heroDesc}>
        Access quality healthcare from the comfort of your home. Connect with
        verified doctors, order medicines, and get professional care delivered
        to your doorstep.
      </Text>
      <TouchableOpacity
        style={styles.signupBtn}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.signupText}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#f7f7f7", paddingHorizontal: 24, paddingVertical: 40,
    paddingTop: Platform.OS === "ios" ? 60 : 45,
  },
  heroTitle: { fontSize: 26, fontWeight: "bold", color: "#052443", marginBottom: 14 },
  heroDesc: { fontSize: 15, color: "#555", lineHeight: 22, marginBottom: 20 },
  signupBtn: {
    borderWidth: 2, borderColor: "#052443", borderRadius: 25,
    paddingHorizontal: 20, paddingVertical: 10, alignSelf: "flex-start",
  },
  signupText: { color: "#052443", fontWeight: "600", fontSize: 15 },
});