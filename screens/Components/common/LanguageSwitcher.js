import React from "react";

import { TouchableOpacity, Text, StyleSheet } from "react-native";

import i18n, { changeAppLanguage } from "../../../i18n/i18n";

const LanguageSwitcher = () => {
    console.log("Current language:", i18n.language);
  const toggleLanguage = async () => {
    const nextLanguage = i18n.language === "en" ? "ar" : "en";

    console.log("Changing language to:", nextLanguage);
    await changeAppLanguage(nextLanguage);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={toggleLanguage}>
      <Text style={styles.text}>
        {i18n.language === "en" ? "العربية" : "English"}
      </Text>
    </TouchableOpacity>
  );
};

export default LanguageSwitcher;

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#39CCCC",
  },

  text: {
    color: "#052443",
    fontWeight: "600",
    fontSize: 13,
  },
});
