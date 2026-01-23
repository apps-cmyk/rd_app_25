import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LobbyScreen from '../screens/LobbyScreen';
import RouletteScreen from '../screens/RouletteScreen';
import CardsScreen from '../screens/CardsScreen';
import WheelOfFortuneScreen from '../screens/WheelOfFortuneScreen';
import DailyBonusScreen from '../screens/DailyBonusScreen';
import ShopScreen from '../screens/ShopScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Lobby" component={LobbyScreen} />
      <Stack.Screen name="Roulette" component={RouletteScreen} />
      <Stack.Screen name="Cards" component={CardsScreen} />
      <Stack.Screen name="Wheel" component={WheelOfFortuneScreen} />
      <Stack.Screen name="DailyBonus" component={DailyBonusScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
