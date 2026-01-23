import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import BalanceBar from '../components/BalanceBar';
import NeonButton from '../components/NeonButton';
import ChipSelector from '../components/ChipSelector';
import GlobalBackground from '../components/GlobalBackground';
import { useGameState } from '../context/GameStateContext';
import {
  createShuffledDeck,
  calculateHandValue,
  getOutcome,
  isBlackjack,
} from '../utils/blackjackLogic';

import TitleBg from '../assets/sc_bg.png';

export default function CardsScreen() {
  const {
    state,
    spendCoins,
    addCoins,
    addXP,
    incrementStat,
    unlockAchievement,
  } = useGameState();

  const [selectedChip, setSelectedChip] = useState(100);
  const [bet, setBet] = useState(0);
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [phase, setPhase] = useState('bet'); 
  const [message, setMessage] = useState('');
  const [suggestion, setSuggestion] = useState('');

  if (!state) return null;

  const canChangeBet = phase === 'bet';

  const startNewRound = () => {
    setDeck([]);
    setPlayerHand([]);
    setDealerHand([]);
    setPhase('bet');
    setMessage('');
    setSuggestion('');
    setBet(0);
  };

  const addToBet = (value) => {
    if (!canChangeBet) return;
    setBet((prev) => prev + value);
  };

  const clearBet = () => {
    if (!canChangeBet) return;
    setBet(0);
  };

  const dealInitial = () => {
    if (!canChangeBet || bet <= 0) return;

    if (!spendCoins(bet)) {
      setMessage('Not enough coins for this bet.');
      return;
    }

    const newDeck = createShuffledDeck();
    const player = [newDeck[0], newDeck[2]];
    const dealer = [newDeck[1], newDeck[3]];

    setDeck(newDeck.slice(4));
    setPlayerHand(player);
    setDealerHand(dealer);
    setPhase('player');
    setMessage('');

    updateSuggestion(player, dealer);

    incrementStat('blackjackHands');
  };

  const drawCard = (forDealer = false) => {
    if (deck.length === 0) {
      setDeck(createShuffledDeck());
    }

    setDeck((prevDeck) => {
      const d = prevDeck.length > 0 ? [...prevDeck] : createShuffledDeck();
      const card = d[0];
      const rest = d.slice(1);

      if (forDealer) {
        setDealerHand((prev) => [...prev, card]);
      } else {
        setPlayerHand((prev) => [...prev, card]);
      }

      return rest;
    });
  };

  const handleHit = () => {
    if (phase !== 'player') return;
    drawCard(false);
  };

  const handleStand = () => {
    if (phase !== 'player') return;
    setPhase('dealer');
    runDealerTurn();
  };

  const handleDouble = () => {
    if (phase !== 'player' || playerHand.length !== 2) return;
    if (!spendCoins(bet)) {
      setMessage('Not enough coins to double.');
      return;
    }
    const newBet = bet * 2;
    setBet(newBet);
    drawCard(false);
    setTimeout(() => {
      setPhase('dealer');
      runDealerTurn(newBet);
    }, 400);
  };

  const runDealerTurn = (currentBet) => {
    const b = currentBet || bet;
    let tempDeck = deck.length > 0 ? [...deck] : createShuffledDeck();
    let tempDealer = [...dealerHand];

    while (calculateHandValue(tempDealer) < 17) {
      const card = tempDeck[0];
      tempDeck = tempDeck.slice(1);
      tempDealer.push(card);
    }

    setDealerHand(tempDealer);
    setDeck(tempDeck);

    finishRound(b, playerHand, tempDealer);
  };

  const finishRound = (currentBet, pHand, dHand) => {
    const outcome = getOutcome(pHand, dHand);
    let payout = 0;
    let msg = '';

    if (outcome === 'blackjack') {
      payout = Math.floor(currentBet * 2.5); // 3:2
      msg = `Blackjack! You win ${payout} coins.`;
      incrementStat('blackjackWins');
      if (!state.achievements?.blackjack_first_win?.unlocked) {
        unlockAchievement('blackjack_first_win');
      }
    } else if (outcome === 'player') {
      payout = currentBet * 2;
      msg = `You win ${payout} coins.`;
      incrementStat('blackjackWins');
    } else if (outcome === 'push') {
      payout = currentBet;
      msg = 'Push – bet returned.';
    } else {
      msg = 'Dealer wins.';
    }

    if (payout > 0) {
      addCoins(payout);
    }

    addXP(12);
    setMessage(msg);
    setPhase('result');
    setSuggestion('');
  };

  const updateSuggestion = (pHand, dHand) => {
    const playerTotal = calculateHandValue(pHand);
    const dealerUp = dHand[0];
    let text = '';

    if (playerTotal <= 11) text = 'Suggested: Hit';
    else if (playerTotal >= 17) text = 'Suggested: Stand';
    else if (dealerUp && ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'].includes(dealerUp.value))
      text = 'Suggested: Hit';
    else text = 'Suggested: Stand';

    setSuggestion(text);
  };

  React.useEffect(() => {
    if (phase === 'player') {
      updateSuggestion(playerHand, dealerHand);
      const total = calculateHandValue(playerHand);
      if (total > 21) {
        finishRound(bet, playerHand, dealerHand);
      }
    }
  }, [playerHand]);

  const renderCard = (card, index, hidden = false) => {
    if (!card) return null;
    const display = hidden ? '🂠' : `${card.value}${card.suit}`;
    return (
      <View key={index} style={[styles.card, hidden && styles.cardHidden]}>
        <Text style={styles.cardText}>{display}</Text>
      </View>
    );
  };

  const playerTotal = calculateHandValue(playerHand);
  const dealerTotal = calculateHandValue(dealerHand);

  return (
    <GlobalBackground>
      <BalanceBar />
      <View style={styles.inner}>
        <View style={styles.titleWrapper}>
          
          <ImageBackground
            source={TitleBg}
            style={styles.titleGlow}
            resizeMode="stretch"
          >
            <Text style={styles.title}>BLACKJACK</Text>
          </ImageBackground>
        </View>

        <View style={styles.table}>
          <Text style={styles.sectionLabel}>DEALER</Text>
          <View style={styles.handRow}>
            {dealerHand.map((card, idx) =>
              phase === 'bet'
                ? renderCard(card, idx, true)
                : phase === 'player' && idx === 1
                ? renderCard(card, idx, true)
                : renderCard(card, idx, false)
            )}
          </View>
          {phase === 'result' || phase === 'dealer' ? (
            <Text style={styles.totalText}>Total: {dealerTotal}</Text>
          ) : null}

          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>PLAYER</Text>
          <View style={styles.handRow}>
            {playerHand.map((card, idx) => renderCard(card, idx, false))}
          </View>
          {playerHand.length > 0 && (
            <Text style={styles.totalText}>Total: {playerTotal}</Text>
          )}

          {suggestion ? <Text style={styles.suggestion}>{suggestion}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>

        <View style={styles.betRow}>
          <Text style={styles.betLabel}>BET: {bet} coins</Text>
          <View style={styles.betButtonsRow}>
            <NeonButton
              title="Clear Bet"
              onPress={clearBet}
              disabled={!canChangeBet || bet === 0}
              style={styles.smallBtn}
            />
          </View>
        </View>
        <ChipSelector
          selected={selectedChip}
          onSelect={(v) => {
            setSelectedChip(v);
            addToBet(v);
          }}
        />

        <View style={styles.actionsRow}>
          <NeonButton
            title="Deal"
            onPress={dealInitial}
            disabled={!canChangeBet || bet <= 0}
            style={styles.actionBtn}
          />
          <NeonButton
            title="Hit"
            onPress={handleHit}
            disabled={phase !== 'player'}
            style={styles.actionBtn}
          />
          <NeonButton
            title="Stand"
            onPress={handleStand}
            disabled={phase !== 'player'}
            style={styles.actionBtn}
          />
        </View>

        <View style={styles.actionsRow}>
          <NeonButton
            title="Double"
            onPress={handleDouble}
            disabled={phase !== 'player' || playerHand.length !== 2}
            style={styles.actionBtn}
          />
          <NeonButton
            title="New Round"
            onPress={startNewRound}
            disabled={phase !== 'result'}
            style={[styles.actionBtn, { flex: 1 }]}
          />
        </View>
      </View>
    </GlobalBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 16,
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
    paddingHorizontal: 26,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#ffffff55',
    shadowColor: '#3f51ff',
    shadowOpacity: 0.9,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 4,
  },
  table: {
    marginTop: 4,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#01002B',
    borderWidth: 2,
    borderColor: '#AC14E8',
  },
  sectionLabel: {
    color: '#b0bec5',
    fontSize: 12,
    marginBottom: 4,
  },
  handRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    width: 44,
    height: 60,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHidden: {
    backgroundColor: '#4527a0',
  },
  cardText: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalText: {
    color: '#ffffffdd',
    marginTop: 4,
    fontSize: 12,
  },
  suggestion: {
    marginTop: 6,
    color: '#ffea00',
    fontSize: 12,
  },
  message: {
    marginTop: 4,
    color: '#ffcc80',
    fontSize: 13,
  },
  betRow: {
    marginTop: 10,
  },
  betLabel: {
    color: '#ffffffdd',
    fontSize: 13,
    marginBottom: 4,
  },
  betButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  smallBtn: {
    width: 110,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
});
