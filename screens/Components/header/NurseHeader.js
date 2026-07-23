
import { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "../../../constants/colors";
import LanguageSwitcher from "../common/LanguageSwitcher";

const NurseHeader = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentRoute = useNavigationState(
    (state) => state?.routes[state.index]?.name
  );

  const navItems = [
    { label: t("nurse.nurseHeader.home"), route: "NurseHome" },
    { label: t("nurse.nurseHeader.newOrders"), route: "NurseNewOrders" },
    { label: t("nurse.nurseHeader.mySchedules"), route: "NurseAppointments" },
  ];

  const goTo = (route) => {
    navigation.navigate(route);
    setIsMenuOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => goTo("NurseHome")}>
          <Image
            source={require("../../../assets/Logo-dark.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>


        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <LanguageSwitcher />
          <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)} hitSlop={10}>
            <FontAwesome5 name="bars" size={22} color={colors.textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {isMenuOpen && (
        <View style={styles.dropdown}>
          {navItems.map((item) => (
            <TouchableOpacity key={item.route} onPress={() => goTo(item.route)}>
              <Text
                style={[
                  styles.navLink,
                  currentRoute === item.route && styles.navLinkActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default NurseHeader;

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 50, // status bar clearance
  },
  logo: { width: 110, height: 36 },
  dropdown: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
  },
  navLink: {
    color: colors.textColor,
    fontWeight: "500",
    fontSize: 16,
  },
  navLinkActive: {
    color: colors.cyan,
    fontWeight: "600",
  },
});
