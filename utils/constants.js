export const DEFAULT_GAME_STATE = {
  coins: 5000,
  gems: 50,
  level: 1,
  xp: 0,
  selectedThemeId: 'neonPurple',
  selectedAvatarId: 'avatar1',
  unlockedThemes: ['neonPurple'],
  unlockedTables: {
    roulette: 'low',
    blackjack: 'low',
  },
  lastDailyClaimDate: null,
  dailyStreak: 0,
  lastFreeWheelSpinTime: null,
  achievements: {},
  stats: {
    rouletteSpins: 0,
    rouletteWins: 0,
    blackjackHands: 0,
    blackjackWins: 0,
    wheelSpins: 0,
  },
};

export const XP_PER_LEVEL_BASE = 120;
export const WHEEL_COOLDOWN_HOURS = 4;

export const THEMES = [
  {
    id: 'neonPurple',
    name: 'Neon Purple',
    primary: '#b517ff',
    secondary: '#5a00b3',
    background: '#050016',
  },
  {
    id: 'neonBlue',
    name: 'Neon Blue',
    primary: '#00f5ff',
    secondary: '#0056ff',
    background: '#020818',
    costGems: 50,
  },
  {
    id: 'neonGold',
    name: 'Neon Gold',
    primary: '#ffd700',
    secondary: '#ff8c00',
    background: '#120800',
    costGems: 80,
  },
];

export const AVATARS = [
  { id: 'avatar1', name: 'Poker Chip', costGems: 0 },
  { id: 'avatar2', name: 'Lucky Ace', costGems: 20 },
  { id: 'avatar3', name: 'Golden Wheel', costGems: 40 },
];

export const DAILY_BONUS_REWARDS = [
  { day: 1, coins: 500, gems: 0 },
  { day: 2, coins: 700, gems: 0 },
  { day: 3, coins: 900, gems: 1 },
  { day: 4, coins: 1200, gems: 1 },
  { day: 5, coins: 1500, gems: 2 },
  { day: 6, coins: 2000, gems: 2 },
  { day: 7, coins: 3000, gems: 5 },
];

export const COIN_PACKS = [
  { id: 'pack1', label: '1,000 Coins', coins: 1000, costGems: 10 },
  { id: 'pack2', label: '5,000 Coins', coins: 5000, costGems: 40 },
  { id: 'pack3', label: '20,000 Coins', coins: 20000, costGems: 120 },
];

export const ACHIEVEMENTS = [
  {
    id: 'roulette_first_win',
    title: 'First Win in Roulette',
    description: 'Win your first roulette spin.',
    rewardCoins: 500,
  },
  {
    id: 'roulette_10_spins',
    title: 'Wheel Veteran',
    description: 'Play 10 roulette spins.',
    rewardCoins: 800,
  },
  {
    id: 'blackjack_5_wins',
    title: 'Blackjack Streak',
    description: 'Win 5 blackjack hands.',
    rewardCoins: 1000,
    rewardGems: 5,
  },
  {
    id: 'wheel_first_spin',
    title: 'First Fortune Spin',
    description: 'Spin the fortune wheel for the first time.',
    rewardCoins: 400,
  },
];
