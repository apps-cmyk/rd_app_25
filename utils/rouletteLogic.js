export const ROULETTE_NUMBERS = Array.from({ length: 37 }, (_, i) => i);

const RED_SET = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18,
  19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export const ROULETTE_COLORS = {};
ROULETTE_NUMBERS.forEach((n) => {
  if (n === 0) {
    ROULETTE_COLORS[n] = 'green';
  } else if (RED_SET.has(n)) {
    ROULETTE_COLORS[n] = 'red';
  } else {
    ROULETTE_COLORS[n] = 'black';
  }
});

export function getRandomWinningNumber() {
  return Math.floor(Math.random() * 37);
}

export function resolveRouletteBets(winningNumber, bets) {
  let totalWin = 0;
  const color = ROULETTE_COLORS[winningNumber];

  const isRed = color === 'red';
  const isBlack = color === 'black';
  const isGreen = color === 'green';

  const isEven = !isGreen && winningNumber % 2 === 0;
  const isOdd = !isGreen && winningNumber % 2 === 1;

  const isLow = winningNumber >= 1 && winningNumber <= 18;
  const isHigh = winningNumber >= 19 && winningNumber <= 36;

  let dozen = null;
  if (!isGreen) {
    if (winningNumber <= 12) dozen = 1;
    else if (winningNumber <= 24) dozen = 2;
    else dozen = 3;
  }

  let column = null;
  if (!isGreen) {
    const mod = winningNumber % 3;
    column = mod === 1 ? 1 : mod === 2 ? 2 : 3;
  }

  bets.forEach((bet) => {
    const { type, value, amount } = bet;
    let payout = 0; 

    switch (type) {
      case 'straight': {
        if (winningNumber === value) {
          payout = amount * 36;
        }
        break;
      }
      case 'color': {
        if (value === 'red' && isRed) payout = amount * 2;
        if (value === 'black' && isBlack) payout = amount * 2;
        break;
      }
      case 'evenOdd': {
        if (isGreen) break;
        if (value === 'even' && isEven) payout = amount * 2;
        if (value === 'odd' && isOdd) payout = amount * 2;
        break;
      }
      case 'lowHigh': {
        if (value === 'low' && isLow) payout = amount * 2;
        if (value === 'high' && isHigh) payout = amount * 2;
        break;
      }
      case 'dozen': {
        if (dozen && dozen === value) {
          payout = amount * 3;
        }
        break;
      }
      case 'column': {
        if (column && column === value) {
          payout = amount * 3;
        }
        break;
      }
      default:
        break;
    }

    totalWin += payout;
  });

  return { totalWin, color };
}
