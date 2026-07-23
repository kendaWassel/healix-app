import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function HeroSection() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <View style={styles.hero}>
      <Text style={styles.heroTitle}>{t("heroSection.title")}</Text>
      <Text style={styles.heroDesc}>
        {t("heroSection.description")}
      </Text>
      <TouchableOpacity
        style={styles.signupBtn}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.signupText}>{t("heroSection.signUp")}</Text>
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