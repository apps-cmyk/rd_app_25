const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createShuffledDeck() {
  const deck = [];
  SUITS.forEach((suit) => {
    VALUES.forEach((value) => {
      deck.push({ suit, value });
    });
  });

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardValue(card) {
  if (card.value === 'A') return 11;
  if (['K', 'Q', 'J'].includes(card.value)) return 10;
  return parseInt(card.value, 10);
}

export function calculateHandValue(hand) {
  let total = 0;
  let aces = 0;

  hand.forEach((card) => {
    total += cardValue(card);
    if (card.value === 'A') aces += 1;
  });

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

export function isBlackjack(hand) {
  return hand.length === 2 && calculateHandValue(hand) === 21;
}

export function getOutcome(playerHand, dealerHand) {
  const playerTotal = calculateHandValue(playerHand);
  const dealerTotal = calculateHandValue(dealerHand);

  const playerBJ = isBlackjack(playerHand);
  const dealerBJ = isBlackjack(dealerHand);

  if (playerBJ && !dealerBJ) return 'blackjack';
  if (!playerBJ && dealerBJ) return 'dealer';
  if (playerBJ && dealerBJ) return 'push';

  if (playerTotal > 21) return 'dealer';
  if (dealerTotal > 21) return 'player';

  if (playerTotal > dealerTotal) return 'player';
  if (playerTotal < dealerTotal) return 'dealer';
  return 'push';
}

export function getPayoutForOutcome(bet, outcome) {
  if (!bet || bet <= 0) return 0;

  switch (outcome) {
    case 'blackjack':
      return Math.floor(bet * 2.5); 
    case 'player':
      return bet * 2;
    case 'push':
      return bet;
    case 'dealer':
    default:
      return 0;
  }
}

export function evaluateBlackjackRound(playerHand, dealerHand, bet) {
  const outcome = getOutcome(playerHand, dealerHand);
  const payout = getPayoutForOutcome(bet, outcome);
  return { outcome, payout };
}
