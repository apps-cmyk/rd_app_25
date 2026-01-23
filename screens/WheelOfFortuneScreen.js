import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BalanceBar from '../components/BalanceBar';
import NeonButton from '../components/NeonButton';
import FortuneWheel from '../components/FortuneWheel';
import GlobalBackground from '../components/GlobalBackground';
import { useGameState } from '../context/GameStateContext';
import { WHEEL_REWARDS } from '../utils/wheelLogic';

import TitleBg from '../assets/sc_bg.png';

const FREE_SPIN_COOLDOWN_MS = 4 * 60 * 60 * 1000;
const STORAGE_KEY_LAST_FREE_SPIN = '@wheel_last_free_spin';
const EXTRA_SPIN_GEMS_COST = 5;

export default function WheelOfFortuneScreen() {
  const {
    state,
    addCoins,
    addXP,
    incrementStat,
    unlockAchievement,
    addGems,
  } = useGameState();

  const [spinning, setSpinning] = useState(false);
  const [targetAngle, setTargetAngle] = useState(0);
  const [lastFreeSpin, setLastFreeSpin] = useState(null);
  const [cooldownLabel, setCooldownLabel] = useState('');
  const [canFreeSpin, setCanFreeSpin] = useState(true);
  const [resultText, setResultText] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_LAST_FREE_SPIN);
        if (stored) {
          const ts = Number(stored);
          if (Number.isFinite(ts)) {
            setLastFreeSpin(ts);
          }
        }
      } catch (e) {
        console.warn('Failed to load last free spin time', e);
      }
    })();
  }, []);

  useEffect(() => {
    const updateCooldown = () => {
      if (!lastFreeSpin || !Number.isFinite(lastFreeSpin)) {
        setCanFreeSpin(true);
        setCooldownLabel('Free spin ready!');
        return;
      }

      const now = Date.now();
      const diff = now - lastFreeSpin;
      const remaining = FREE_SPIN_COOLDOWN_MS - diff;

      if (remaining <= 0) {
        setCanFreeSpin(true);
        setCooldownLabel('Free spin ready!');
      } else {
        setCanFreeSpin(false);
        const totalSec = Math.floor(remaining / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const pad = (n) => String(n).padStart(2, '0');
        setCooldownLabel(`Next free spin in ${pad(h)}:${pad(m)}:${pad(s)}`);
      }
    };

    updateCooldown();
    const id = setInterval(updateCooldown, 1000);
    return () => clearInterval(id);
  }, [lastFreeSpin]);

  if (!state) return null;

  const formatRewardText = (reward) => {
    if (!reward) return '';
    if (reward.type === 'coins') return `+${reward.amount} coins`;
    if (reward.type === 'gems') return `+${reward.amount} gems`;
    if (reward.type === 'xp') return `+${reward.amount} XP`;
    return reward.label || 'Reward!';
  };

  const applyReward = (reward) => {
    if (!reward) return;

    if (reward.type === 'coins') {
      addCoins(reward.amount);
    } else if (reward.type === 'gems' && typeof addGems === 'function') {
      addGems(reward.amount);
    } else if (reward.type === 'xp') {
      addXP(reward.amount);
    }

    addXP(5);

    if (typeof incrementStat === 'function') {
      incrementStat('wheelSpins');
    }
    if (
      unlockAchievement &&
      !state.achievements?.wheel_first_spin?.unlocked
    ) {
      unlockAchievement('wheel_first_spin');
    }
  };

  const spinInternal = () => {
    const n = WHEEL_REWARDS.length;
    const winningIndex = Math.floor(Math.random() * n);
    const reward = WHEEL_REWARDS[winningIndex];

    const anglePer = 360 / n;
    const spins = 4;

    const finalAngle = spins * 360 + 180 - winningIndex * anglePer;

    setResultText('');
    setSpinning(true);
    setTargetAngle(finalAngle);

    setTimeout(() => {
      applyReward(reward);
      setResultText(`You won: ${formatRewardText(reward)}`);
      setSpinning(false);
    }, 2700);
  };

  const handleFreeSpin = async () => {
    if (spinning) return;
    if (!canFreeSpin) {
      setResultText('Free spin is not ready yet.');
      return;
    }

    const now = Date.now();
    try {
      await AsyncStorage.setItem(STORAGE_KEY_LAST_FREE_SPIN, String(now));
    } catch (e) {
      console.warn('Failed to store last free spin time', e);
    }
    setLastFreeSpin(now);

    spinInternal();
  };

  const handleExtraSpin = () => {
    if (spinning) return;
    if (!state) return;

    const currentGems = state.gems || 0;
    if (currentGems < EXTRA_SPIN_GEMS_COST) {
      setResultText('Not enough gems for extra spin.');
      return;
    }

    if (typeof addGems === 'function') {
      addGems(-EXTRA_SPIN_GEMS_COST);
    }

    spinInternal();
  };

  return (
    <GlobalBackground>
      <BalanceBar />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleWrapper}>
          
          <ImageBackground
            source={TitleBg}
            style={styles.titleGlow}
            resizeMode="stretch"
          >
            <Text style={styles.title}>WHEEL OF FORTUNE</Text>
          </ImageBackground>
        </View>

        <View style={styles.wheelCard}>
          <FortuneWheel
            spinning={spinning}
            targetAngle={targetAngle}
            segments={WHEEL_REWARDS}
          />
        </View>

        {resultText ? (
          <Text style={styles.resultText}>{resultText}</Text>
        ) : null}

        <View style={styles.infoBlock}>
          <Text style={styles.cooldownText}>{cooldownLabel}</Text>
        </View>

        <View style={styles.buttonsRow}>
          <View style={styles.buttonWrapper}>
            <NeonButton
              title="FREE SPIN"
              onPress={handleFreeSpin}
              disabled={!canFreeSpin || spinning}
              style={styles.button}
            />
          </View>
          <View style={styles.buttonWrapper}>
            <NeonButton
              title="EXTRA SPIN"
              onPress={handleExtraSpin}
              disabled={spinning}
              style={styles.button}
            />
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </GlobalBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  titleWrapper: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  subtitle: {
    color: '#9fa8da',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 2,
  },
  titleGlow: {
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#ffffff55',
    shadowColor: '#ff3bff',
    shadowOpacity: 0.9,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
  },
  wheelCard: {
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 4,
    marginBottom: 4,
    alignItems: 'center',
  },
  resultText: {
    color: '#ffd700',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 4,
    fontWeight: '600',
  },
  infoBlock: {
    marginTop: 8,
    alignItems: 'center',
  },
  cooldownText: {
    color: '#b0bec5',
    fontSize: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  button: {
    borderRadius: 24,
    width: '100%',
  },
});
