import React from 'react';
import { StyleSheet, ScrollView, Text } from 'react-native';
import BalanceBar from '../components/BalanceBar';
import AchievementCard from '../components/AchievementCard';
import { useGameState } from '../context/GameStateContext';
import { ACHIEVEMENTS } from '../utils/constants';
import GlobalBackground from '../components/GlobalBackground';

export default function AchievementsScreen() {
  const { state } = useGameState();
  if (!state) return null;
  return (
    <GlobalBackground>
      <BalanceBar />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Achievements</Text>
        {ACHIEVEMENTS.map((def) => {
          const unlocked = state.achievements?.[def.id]?.unlocked;
          return (
            <AchievementCard key={def.id} definition={def} unlocked={unlocked} />
          );
        })}
      </ScrollView>
    </GlobalBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
});
