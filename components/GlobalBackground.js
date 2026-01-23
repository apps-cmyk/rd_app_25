import React from "react";
import { ImageBackground, StyleSheet } from "react-native";

export default function GlobalBackground({ children }) {
  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
