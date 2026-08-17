import { View, Text,Image, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../common/LanguageSwitcher";

const LandingHeader = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <View style={styles.nav}>
      {/* Logo */}
      <TouchableOpacity onPress={() => navigation.navigate("DoctorHome")}>
                  <Image
                    source={require("../../../assets/Logo-dark.png")}
                    style={styles.logo}
                    resizeMode="contain"
                  />
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
  logo: { width: 90, height: 32 },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
 
  buttons: { flexDirection: "row", alignItems: "center", gap: 10 },
  signInBtn: {
    backgroundColor: "#052443",
    borderWidth: 2,
    borderColor: "#052443",
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  signInText: { color: "#fff", fontWeight: "600", fontSize: 14 },

});