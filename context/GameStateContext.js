import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@neon_social_casino_state_v1';

const getXpForLevel = (level) => {
  const lvl = Math.max(1, level || 1);
  return 200 + (lvl - 1) * 120; 
};

const defaultState = {
  coins: 5000,
  gems: 50,
  playerName: 'Guest',
  level: 1,
  xp: 0,
  xpForNext: getXpForLevel(1),

  stats: {
    rouletteSpins: 0,
    rouletteWins: 0,
    blackjackHands: 0,
    blackjackWins: 0,
    wheelSpins: 0,
  },

  achievements: {
    roulette_first_win: {
      id: 'roulette_first_win',
      title: 'First Roulette Win',
      description: 'Win once in roulette.',
      rewardCoins: 500,
      unlocked: false,
    },
    roulette_10_spins: {
      id: 'roulette_10_spins',
      title: 'Roulette Fan',
      description: 'Play 10 roulette spins.',
      rewardCoins: 1000,
      unlocked: false,
    },
    blackjack_first_win: {
      id: 'blackjack_first_win',
      title: 'First Blackjack Win',
      description: 'Win a hand in blackjack.',
      rewardCoins: 500,
      unlocked: false,
    },
    wheel_first_spin: {
      id: 'wheel_first_spin',
      title: 'First Wheel Spin',
      description: 'Use the Wheel of Fortune once.',
      rewardCoins: 300,
      unlocked: false,
    },
  },

  lastDailyClaimDate: null, 
  dailyStreak: 0,
};

const GameStateContext = createContext(null);

export function GameStateProvider({ children }) {
  const [state, setState] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const loadedLevel = parsed.level || defaultState.level;
          setState({
            ...defaultState,
            ...parsed,
            level: loadedLevel,
            xpForNext: getXpForLevel(loadedLevel),
            stats: { ...defaultState.stats, ...(parsed.stats || {}) },
            achievements: {
              ...defaultState.achievements,
              ...(parsed.achievements || {}),
            },
          });
        } else {
          setState(defaultState);
        }
      } catch (e) {
        console.warn('Failed to load game state', e);
        setState(defaultState);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated || !state) return;
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn('Failed to save game state', e);
      }
    })();
  }, [state, hydrated]);

  const addCoins = (amount) => {
    if (!state) return;
    if (!Number.isFinite(amount)) return;
    setState((prev) => ({
      ...prev,
      coins: Math.max(0, (prev.coins || 0) + amount),
    }));
  };

  const spendCoins = (amount) => {
    if (!state) return false;
    const current = state.coins || 0;
    if (current < amount) return false;
    setState((prev) => ({
      ...prev,
      coins: Math.max(0, (prev.coins || 0) - amount),
    }));
    return true;
  };

  const addGems = (amount) => {
    if (!state) return;
    if (!Number.isFinite(amount)) return;
    setState((prev) => ({
      ...prev,
      gems: Math.max(0, (prev.gems || 0) + amount),
    }));
  };

  const addXP = (amount) => {
    if (!state) return;
    if (!Number.isFinite(amount) || amount <= 0) return;

    setState((prev) => {
      let level = prev.level || 1;
      let xp = (prev.xp || 0) + amount;
      let xpForNext = getXpForLevel(level);
      let coins = prev.coins || 0;
      let gems = prev.gems || 0;

      while (xp >= xpForNext) {
        xp -= xpForNext;
        level += 1;
        xpForNext = getXpForLevel(level);

        coins += 2000;
        gems += 3;
      }

      return {
        ...prev,
        level,
        xp,
        xpForNext,
        coins,
        gems,
      };
    });
  };

  const incrementStat = (key) => {
    if (!state) return;
    setState((prev) => ({
      ...prev,
      stats: {
        ...(prev.stats || {}),
        [key]: (prev.stats?.[key] || 0) + 1,
      },
    }));
  };

  const unlockAchievement = (id) => {
    if (!state) return;
    const current = state.achievements?.[id];
    if (!current || current.unlocked) return;

    setState((prev) => {
      const ach = prev.achievements?.[id];
      if (!ach || ach.unlocked) return prev;

      const rewardCoins = ach.rewardCoins || 0;
      return {
        ...prev,
        coins: (prev.coins || 0) + rewardCoins,
        achievements: {
          ...(prev.achievements || {}),
          [id]: {
            ...ach,
            unlocked: true,
          },
        },
      };
    });
  };

  const updatePlayerName = (newName) => {
    setState((prev) => ({
      ...prev,
      playerName: newName,
      nickname: newName,
      profileName: newName,
    }));
  };

  const setLastDailyClaim = (dateISO, newStreak) => {
    setState((prev) => ({
      ...prev,
      lastDailyClaimDate: dateISO ?? prev.lastDailyClaimDate,
      dailyStreak:
        typeof newStreak === 'number' ? newStreak : prev.dailyStreak || 0,
    }));
  };

  const value = {
    state,
    setState,
    addCoins,
    spendCoins,
    addGems,
    addXP,
    incrementStat,
    unlockAchievement,
    updatePlayerName,
    setLastDailyClaim,
  };

  if (!hydrated || !state) return null;

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  return useContext(GameStateContext);
}
