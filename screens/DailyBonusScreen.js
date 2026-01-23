import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import BalanceBar from '../components/BalanceBar';
import NeonButton from '../components/NeonButton';
import { useGameState } from '../context/GameStateContext';
import { DAILY_BONUS_REWARDS } from '../utils/constants';
import GlobalBackground from '../components/GlobalBackground';

export default function DailyBonusScreen() {
  const { state, addCoins, addGems, setLastDailyClaim } = useGameState();

  if (!state) return null;

  const today = new Date().toISOString().slice(0, 10);
  const last = state.lastDailyClaimDate;
  const isSameDay = last === today;
  const streak = state.dailyStreak || 0;
  let nextStreakDay = streak + (isSameDay ? 0 : 1);
  if (nextStreakDay > DAILY_BONUS_REWARDS.length) nextStreakDay = DAILY_BONUS_REWARDS.length;

  const canClaim = !isSameDay;
  const reward = DAILY_BONUS_REWARDS[nextStreakDay - 1];

  const handleClaim = () => {
    if (!canClaim) return;
    addCoins(reward.coins);
    if (reward.gems) addGems(reward.gems);
    setLastDailyClaim(today, nextStreakDay);
    Alert.alert('Daily bonus claimed!', `You received ${reward.coins} Coins and ${reward.gems} Gems.`);
  };

  return (
    <GlobalBackground>
      <BalanceBar />
      <View style={styles.content}>
        <Text style={styles.title}>Daily Bonus</Text>
        <Text style={styles.subtitle}>
          Log in every day to build your streak and get bigger rewards.
        </Text>

        <View style={styles.calendar}>
          {DAILY_BONUS_REWARDS.map((r) => {
            const dayClaimed = state.dailyStreak >= r.day;
            const isNext = r.day === nextStreakDay && canClaim;
            return (
              <View
                key={r.day}
                style={[
                  styles.dayCell,
                  dayClaimed && styles.dayClaimed,
                  isNext && styles.dayNext,
                ]}
              >
                <Text style={styles.dayLabel}>Day {r.day}</Text>
                <Text style={styles.dayReward}>{r.coins}c {r.gems ? `+ ${r.gems}g` : ''}</Text>
                <Text style={styles.dayStatus}>
                  {dayClaimed ? 'Claimed' : isNext ? 'Next' : 'Locked'}
                </Text>
              </View>
            );
          })}
        </View>

        <NeonButton
          title={canClaim ? 'Claim Today\'s Reward' : 'Already claimed today'}
          disabled={!canClaim}
          onPress={handleClaim}
          style={{ marginTop: 16 }}
        />
      </View>
    </GlobalBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16 },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: { color: '#ffffffaa', fontSize: 12, textAlign: 'center', marginBottom: 12 },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: '48%',
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#140029',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffffff22',
  },
  dayClaimed: { borderColor: '#4afc8f' },
  dayNext: { borderColor: '#ffd700' },
  dayLabel: { color: 'white', fontWeight: '700' },
  dayReward: { color: '#ffd700', marginTop: 4 },
  dayStatus: { marginTop: 4, color: '#ffffffaa', fontSize: 11 },
});
