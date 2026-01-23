import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AchievementCard({ definition, unlocked }) {
  return (
    <View style={[styles.container, unlocked && styles.unlocked]}>
      <Text style={styles.title}>
        {definition.title}
      </Text>
      <Text style={styles.desc}>
        {definition.description}
      </Text>
      <Text style={styles.reward}>
        Reward: {definition.rewardCoins || 0} Coins{definition.rewardGems ? `, ${definition.rewardGems} Gems` : ''}
      </Text>
      <Text style={[styles.status, unlocked && { color: '#4afc8f' }]}>
        {unlocked ? 'Unlocked' : 'Locked'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 6,
    backgroundColor: '#01002B',
    borderWidth: 1,
    borderColor: '#ffffff22',
  },
  unlocked: {
    borderColor: '#AC14E8',
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  desc: {
    color: '#ffffff88',
    fontSize: 12,
    marginBottom: 4,
  },
  reward: {
    color: '#ffd700',
    fontSize: 12,
    marginBottom: 4,
  },
  status: {
    color: '#ff5182',
    fontSize: 12,
    fontWeight: '600',
  },
});
