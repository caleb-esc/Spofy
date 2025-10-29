import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from "./src/navigation/TabNavigator";
import { PlayerProvider } from "./src/context/PlayerContext";
import BottomPlayer from "./src/components/BottomPlayer";

export default function App() {
  return (
    <PlayerProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <TabNavigator />
          <BottomPlayer />
        </View>
      </NavigationContainer>
    </PlayerProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
});