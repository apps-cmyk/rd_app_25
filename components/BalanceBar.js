import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameState } from '../context/GameStateContext';

import TopBarBg from '../assets/top_bar_bg.png';

const BAR_CONTENT_HEIGHT = 56; 

export default function BalanceBar() {
  const { state } = useGameState();
  const insets = useSafeAreaInsets();

  if (!state) return null;

  const coins = state.coins || 0;
  const gems = state.gems || 0;
  const level = state.level || state.currentLevel || 1;
  const xp = state.xp || state.currentXP || 0;
  const xpForNext =
    state.xpForNext || (state.level ? state.level * 120 : level * 120);

  const playerName =
    state.playerName || state.nickname || state.profileName || 'Guest';

  const xpProgress = Math.max(
    0,
    Math.min(1, xpForNext > 0 ? xp / xpForNext : 0)
  );

  return (
    <ImageBackground
      source={TopBarBg}
      resizeMode="stretch"
      style={[
        styles.bg,
        {
          height: insets.top + BAR_CONTENT_HEIGHT,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.leftBlock}>
          <Text style={styles.playerName} numberOfLines={1}>
            {playerName}
          </Text>
          <View style={styles.levelRow}>
            <Text style={styles.levelText}>Lv {level}</Text>
            <View style={styles.xpTrack}>
              <View
                style={[styles.xpFill, { width: `${xpProgress * 100}%` }]}
              />
            </View>
          </View>
        </View>

        <View style={styles.rightBlock}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>COINS</Text>
            <Text style={styles.balanceValue}>{coins.toLocaleString()}</Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>GEMS</Text>
            <Text style={styles.balanceValue}>{gems.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    width: '100%',
    alignSelf: 'stretch',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  leftBlock: {
    flex: 1.4,
    paddingRight: 8,
  },
  playerName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  levelText: {
    color: '#ffd54f',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 6,
  },
  xpTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#140335',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#8a2eff',
  },
  rightBlock: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  balanceItem: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: '#b0bec5',
    fontSize: 10,
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
