import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet,Platform,I18nManager } from "react-native";

import { useNavigation, useNavigationState } from "@react-navigation/native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { colors } from "../../../constants/colors";


const DeliveryHeader = () => {
    console.log("RTL:", I18nManager.isRTL);
  const { t } = useTranslation();
    const navigation = useNavigation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const currentRoute = useNavigationState(
      (state) => state?.routes[state.index]?.name
    );
  
    const navItems = [
      { label: t("header.home"), route: "DeliveryHome" },
      { label: t("header.newOrders"), route: "NewOrders" },
      { label: t("header.myOrders"), route: "MyOrders" },
    ];
  

  const navigate = (screen) => {
    navigation.navigate(screen);
    setIsMenuOpen(false);
  };

return (
<View style={styles.nav}>

  {/* Logo */}
  <TouchableOpacity onPress={() => navigate("DeliveryHome")}>
    <Image
      source={require("../../../assets/Logo-dark.png")}
      style={styles.logo}
    />
  </TouchableOpacity>


  {/* Right side */}
  <View style={styles.rightSection}>

<LanguageSwitcher />


    <TouchableOpacity 
      style={styles.menuButton}
      onPress={()=>setIsMenuOpen(!isMenuOpen)}
    >
      <Ionicons
        name={isMenuOpen ? "close" : "menu"}
        size={30}
        color="#052443"
      />
    </TouchableOpacity>

  </View>


  {/* Dropdown */}
  {isMenuOpen && (
    <View style={styles.mobileMenu}>

  <TouchableOpacity onPress={() => navigate("DeliveryHome")}>
  <Text
    style={
      currentRoute === "DeliveryHome"
        ? styles.activeLink
        : styles.link
    }
  >
    {t("header.home")}
  </Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => navigate("NewOrders")}>
  <Text
    style={
      currentRoute === "NewOrders"
        ? styles.activeLink
        : styles.link
    }
  >
    {t("header.newOrders")}
  </Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => navigate("MyOrders")}>
  <Text
    style={
      currentRoute === "MyOrders"
        ? styles.activeLink
        : styles.link
    }
  >
    {t("header.myOrders")}
  </Text>
</TouchableOpacity>

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
  )}

</View>
);
};

export default DeliveryHeader;

const styles = StyleSheet.create({

  nav: {
    height: 85,

flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 20,
    paddingTop: 20,

    backgroundColor: "#fff",

    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",

    position: "relative",
    zIndex: 10,
  },


  logo: {
    width: 100,
    height: 35,
  },


  rightSection: {
flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 15,
  },

  menuButton: {
    justifyContent: "center",
    alignItems: "center",
  },


  mobileMenu: {

    position: "absolute",

    top: 65,

    left: 0,
    right: 0,


    backgroundColor: "#fff",


    paddingHorizontal: 20,
    paddingVertical: 20,

 alignItems:I18nManager.isRTL
   ? "flex-end"
   : "flex-start",

    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",


    elevation: 5,

    shadowColor:"#000",
    shadowOpacity:0.1,
    shadowRadius:5,


    gap: 18,

    zIndex: 100,
  },


  link: {
    fontSize: 16,

    color:"#374151",

    fontWeight:"500",
  },


  activeLink:{
    fontSize:16,

    color:"#39CCCC",

    fontWeight:"700",
  },


  badge:{
 flexDirection:I18nManager.isRTL
   ? "row-reverse"
   : "row",

    alignItems:"center",

    gap:8,

    marginTop:10,
  },


  badgeText:{
    color:"#052443",

    fontWeight:"600",

    fontSize:15,
  },

});
