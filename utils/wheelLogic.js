export const WHEEL_REWARDS = [
  { label: '100', type: 'coins', amount: 100, color: '#29b6f6' },
  { label: '250', type: 'coins', amount: 250, color: '#ab47bc' },
  { label: '500', type: 'coins', amount: 500, color: '#ef5350' },
  { label: 'XP +20', type: 'xp', amount: 20, color: '#ffa726' },
  { label: '1000', type: 'coins', amount: 1000, color: '#66bb6a' },
  { label: 'GEM +3', type: 'gems', amount: 3, color: '#ec407a' },
  { label: '750', type: 'coins', amount: 750, color: '#5c6bc0' },
  { label: 'XP +40', type: 'xp', amount: 40, color: '#ffb300' },
];

export function getRandomWheelIndex() {
  return Math.floor(Math.random() * WHEEL_REWARDS.length);
}
