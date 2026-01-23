import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NeonButton from '../components/NeonButton';
import BalanceBar from '../components/BalanceBar';
import GlobalBackground from '../components/GlobalBackground';
import { useGameState } from '../context/GameStateContext';
import { DAILY_BONUS_REWARDS } from '../utils/constants';

import CardsLogo from '../assets/logo.png';

function timeUntil(timestampMs) {
  const now = Date.now();
  const diff = timestampMs - now;
  if (diff <= 0) return '00:00';
  const totalSeconds = Math.floor(diff / 1000);
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60, 10).padStart(2, '0');
  return `${m}:${s}`;
}

export default function LobbyScreen({ navigation }) {
  const { state, WHEEL_COOLDOWN_HOURS } = useGameState();
  const [wheelCountdown, setWheelCountdown] = useState('00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      if (!state?.lastFreeWheelSpinTime) {
        setWheelCountdown('Ready');
      } else {
        const cooldownMs = WHEEL_COOLDOWN_HOURS * 60 * 60 * 1000;
        const nextFree =
          new Date(state.lastFreeWheelSpinTime).getTime() + cooldownMs;
        setWheelCountdown(timeUntil(nextFree));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state, WHEEL_COOLDOWN_HOURS]);

  if (!state) return null;

  const today = new Date().toISOString().slice(0, 10);
  const canClaimDaily = state.lastDailyClaimDate !== today;
  const streakDay = Math.min(
    state.dailyStreak + (canClaimDaily ? 1 : 0),
    DAILY_BONUS_REWARDS.length
  );
  const rewardPreview = DAILY_BONUS_REWARDS[streakDay - 1];

  const xpForNext = state.level * 120;
  const xpProgress = Math.min(1, state.xp / xpForNext);

  return (
    <GlobalBackground>
      <BalanceBar />

      <LinearGradient
        colors={['#00f5ff22', 'transparent']}
        style={[styles.glowCircle, { top: 40, left: -80 }]}
      />
      <LinearGradient
        colors={['#ff00ff33', 'transparent']}
        style={[styles.glowCircle, { top: 220, right: -80 }]}
      />
      <LinearGradient
        colors={['#ffb30033', 'transparent']}
        style={[styles.glowCircle, { bottom: -40, left: 0 }]}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topArt}>
          <Image
            source={CardsLogo}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.menuGrid}>
          <View style={styles.menuRow}>
            <GameCard
              label="ROULETTE"
              accent="#ff3b6b"
              icon="🎡"
              onPress={() => navigation.navigate('Roulette')}
            />
            <GameCard
              label="CARDS"
              accent="#ff3bff"
              icon="🂡"
              onPress={() => navigation.navigate('Cards')}
            />
          </View>
          <View style={styles.menuRow}>
            <GameCard
              label="WHEEL OF FORTUNE"
              accent="#21d4fd"
              icon="🎰"
              onPress={() => navigation.navigate('Wheel')}
            />
            <GameCard
              label="SHOP"
              accent="#ffc400"
              icon="💰"
              onPress={() => navigation.navigate('Shop')}
            />
          </View>
        </View>

        <Pressable onPress={() => navigation.navigate('DailyBonus')}>
          <LinearGradient
            colors={['#070d3a', '#17004a']}
            style={styles.dailyCard}
          >
            <View style={styles.dailyHeader}>
              <Text style={styles.dailyTitle}>DAILY BONUS</Text>
            </View>
            <View style={styles.dailyContent}>
              <View style={styles.chipOuter}>
                <LinearGradient
                  colors={['#ff3b6b', '#ff9a3b']}
                  style={styles.chipInner}
                >
                  <Text style={styles.chipValue}>
                    {rewardPreview.coins.toLocaleString()}
                  </Text>
                </LinearGradient>
              </View>
              <NeonButton
                title={canClaimDaily ? 'CLAIM' : 'CLAIMED'}
                disabled={!canClaimDaily}
                onPress={() => navigation.navigate('DailyBonus')}
                style={styles.dailyButton}
              />
            </View>
          </LinearGradient>
        </Pressable>

        <View style={[styles.menuGrid, { marginTop: 14 }]}>
          <View style={styles.menuRow}>
            <GameCard
              label="ACHIEVEMENTS"
              accent="#4afc8f"
              icon="🏆"
              onPress={() => navigation.navigate('Achievements')}
            />
            <GameCard
              label="SETTINGS"
              accent="#bbbbff"
              icon="⚙️"
              onPress={() => navigation.navigate('Settings')}
            />
          </View>
        </View>

        <View style={styles.xpBarWrapper}>
          <LinearGradient
            colors={['#1a0050', '#001a50']}
            style={styles.xpBarBg}
          >
            <View style={styles.xpLeft}>
              <Text style={styles.starIcon}>⭐</Text>
            </View>
            <View style={styles.xpCenter}>
              <View style={styles.xpTrack}>
                <View
                  style={[styles.xpFill, { width: `${xpProgress * 100}%` }]}
                />
              </View>
            </View>
            <View style={styles.xpRight}>
              <Text style={styles.xpText}>Lv {state.level}</Text>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.bottomTimer}>
          Next free spin: {wheelCountdown}
        </Text>

        <View style={{ height: 24 }} />
      </ScrollView>
    </GlobalBackground>
  );
}

function GameCard({ label, icon, accent, onPress }) {
  return (
    <Pressable style={styles.gameCardWrapper} onPress={onPress}>
      <LinearGradient
        colors={['#05001a', '#090035']}
        style={styles.gameCardOuter}
      >
        <View
          style={[
            styles.gameCardInner,
            {
              shadowColor: accent,
            },
          ]}
        >
          <View style={styles.gameIconCircle}>
            <Text style={styles.gameIcon}>{icon}</Text>
          </View>
          <Text
            style={[styles.gameLabel, { color: accent }]}
            numberOfLines={2}
          >
            {label}
          </Text>
          <Text style={styles.gameTapHint}>TAP TO PLAY</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.8,
    zIndex: -1,
  },
  topArt: {
    marginTop: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  logoImage: {
    width: 180,
    height: 180,
  },
  menuGrid: {
    width: '100%',
    marginTop: 10,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gameCardWrapper: {
    width: '48%',
  },
  gameCardOuter: {
    borderRadius: 16,
    padding: 2,
    borderWidth: 1,
    borderColor: '#00ffff44',
  },
  gameCardInner: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    backgroundColor: '#070020',
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  gameIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#ffffffaa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    backgroundColor: '#0b0233',
  },
  gameIcon: {
    fontSize: 22,
  },
  gameLabel: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  gameTapHint: {
    marginTop: 4,
    fontSize: 9,
    color: '#ffffffaa',
  },
  dailyCard: {
    width: '100%',
    borderRadius: 24,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#00ffff55',
    shadowColor: '#00ffff',
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  dailyHeader: {
    alignItems: 'center',
    marginBottom: 4,
  },
  dailyTitle: {
    color: '#ffd54f',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  dailyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  chipOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#00ffffaa',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050018',
  },
  chipInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipValue: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
  },
  dailyButton: {
    width: 120,
  },
  xpBarWrapper: {
    width: '100%',
    marginTop: 20,
  },
  xpBarBg: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00ffff55',
  },
  xpLeft: {
    width: 30,
    alignItems: 'center',
  },
  xpCenter: {
    flex: 1,
    paddingHorizontal: 6,
  },
  xpRight: {
    width: 50,
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 16,
  },
  xpTrack: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#050013',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#8a2eff',
  },
  xpText: {
    color: '#ffffffdd',
    fontWeight: '700',
    fontSize: 12,
  },
  bottomTimer: {
    marginTop: 6,
    color: '#ffffffaa',
    fontSize: 11,
    alignSelf: 'flex-end',
    marginRight: 8,
  },
});
