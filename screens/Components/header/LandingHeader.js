import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../common/LanguageSwitcher";

const LandingHeader = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <View style={styles.nav}>
      {/* Logo */}
      <TouchableOpacity onPress={() => navigation.navigate("Landing")}>
        <Text style={styles.logo}>
          Heal<Text style={{ color: "#39CCCC" }}>ix</Text>
        </Text>
      </TouchableOpacity>

      {/* الأزرار */}
      <View style={styles.buttons}>
        <LanguageSwitcher />

        <TouchableOpacity
          style={styles.signInBtn}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.signInText}>{t("landingHeader.signIn")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signUpBtn}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.signUpText}>{t("landingHeader.signUp")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LandingHeader;

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingTop: Platform.OS === "ios" ? 50 : 35,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  logo: { fontSize: 26, fontWeight: "bold", color: "#052443" },
  logoImg: { width: 110, height: 36 },
  buttons: { flexDirection: "row", alignItems: "center", gap: 6 },
  signInBtn: {
    backgroundColor: "#052443",
    borderWidth: 2,
    borderColor: "#052443",
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  signInText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  signUpBtn: {
    borderWidth: 2,
    borderColor: "#052443",
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  signUpText: { color: "#052443", fontWeight: "600", fontSize: 14 },
});