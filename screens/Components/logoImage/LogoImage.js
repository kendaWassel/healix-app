// components/logoImage/LogoImage.js
import React from "react";
import { View, Image, StyleSheet } from "react-native";

const LogoImage = ({ style }) => {
  return (
    <View style={[styles.wrapper, style]}>
      <Image
        source={require("../../assets/LogoRegister.png")}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
};

export default LogoImage;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});