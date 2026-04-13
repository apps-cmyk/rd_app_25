import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MASTER_ANDROID } from './MASTER_ANDROID';
import { GameStateProvider } from './context/GameStateContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GameStateProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <MASTER_ANDROID/>
          </NavigationContainer>
        </GameStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
