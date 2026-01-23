import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BalanceBar from '../components/BalanceBar';
import NeonButton from '../components/NeonButton';
import ChipSelector from '../components/ChipSelector';
import RouletteWheel from '../components/RouletteWheel';
import GlobalBackground from '../components/GlobalBackground';
import { useGameState } from '../context/GameStateContext';
import {
  resolveRouletteBets,
  getRandomWinningNumber,
  ROULETTE_NUMBERS,
} from '../utils/rouletteLogic';

import TitleBg from '../assets/sc_bg.png';

export default function RouletteScreen() {
  const {
    state,
    spendCoins,
    addCoins,
    addXP,
    incrementStat,
    unlockAchievement,
  } = useGameState();

  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState([]);
  const [lastBets, setLastBets] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [targetAngle, setTargetAngle] = useState(0);
  const [winningNumber, setWinningNumber] = useState(null);
  const [history, setHistory] = useState([]);
  const [resultText, setResultText] = useState('');

  if (!state) return null;

  const totalBet = bets.reduce((sum, b) => sum + b.amount, 0);

  const keyForBet = (type, value) => `${type}:${String(value)}`;

  const getBetTotal = (type, value) =>
    bets
      .filter((b) => b.type === type && String(b.value) === String(value))
      .reduce((sum, b) => sum + b.amount, 0);

  const placeBet = (bet) => {
    if (spinning) return;
    if (!spendCoins(selectedChip)) return;
    setBets((prev) => [...prev, { ...bet, amount: selectedChip }]);
  };

  const handleSpin = () => {
    if (spinning || bets.length === 0) return;

    const winNum = getRandomWinningNumber();
    const winIndex = ROULETTE_NUMBERS.indexOf(winNum);
    const anglePer = 360 / ROULETTE_NUMBERS.length;
    const spinRounds = 4;

    const angle = spinRounds * 360 - winIndex * anglePer;

    setSpinning(true);
    setTargetAngle(angle);
    setWinningNumber(null);
    setResultText('');

    setTimeout(() => {
      const { totalWin, color } = resolveRouletteBets(winNum, bets);

      if (totalWin > 0) {
        addCoins(totalWin);
        setResultText(
          `Number ${winNum} (${color?.toUpperCase?.() || ''}) – You won ${totalWin} coins!`
        );
        incrementStat('rouletteWins');
        if (!state.achievements?.roulette_first_win?.unlocked) {
          unlockAchievement('roulette_first_win');
        }
      } else {
        setResultText(`Number ${winNum} – No win this time.`);
      }

      addXP(10);
      incrementStat('rouletteSpins');
      if (
        state.stats.rouletteSpins + 1 >= 10 &&
        !state.achievements?.roulette_10_spins?.unlocked
      ) {
        unlockAchievement('roulette_10_spins');
      }

      setHistory((prev) => [{ num: winNum }, ...prev].slice(0, 12));
      setWinningNumber(winNum);
      setSpinning(false);
      setLastBets(bets);
      setBets([]);
    }, 2700);
  };

  const handleClear = () => {
    if (spinning) return;
    if (bets.length > 0) {
      const refund = bets.reduce((sum, b) => sum + b.amount, 0);
      addCoins(refund);
    }
    setBets([]);
  };

  const handleUndo = () => {
    if (spinning || bets.length === 0) return;
    const last = bets[bets.length - 1];
    addCoins(last.amount);
    setBets((prev) => prev.slice(0, -1));
  };

  const handleRebet = () => {
    if (spinning || lastBets.length === 0) return;
    const cost = lastBets.reduce((sum, b) => sum + b.amount, 0);
    if (!spendCoins(cost)) return;
    setBets(lastBets.map((b) => ({ ...b })));
  };

  const renderBetCell = (label, betType, betValue, extraStyle = {}) => {
    const amount = getBetTotal(betType, betValue);

    return (
      <Pressable
        key={keyForBet(betType, betValue)}
        onPress={() => placeBet({ type: betType, value: betValue })}
        style={[styles.betCell, extraStyle]}
      >
        <Text style={styles.betLabel}>{label}</Text>
        {amount > 0 && (
          <View style={styles.betChip}>
            <Text style={styles.betChipText}>{amount}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const renderHistory = () => (
    <View style={styles.historyBlock}>
      <Text style={styles.historyTitle}>HISTORY</Text>
      <View style={styles.historyRow}>
        {history.map((h, index) => {
          const isRed = h.num !== 0 && h.num % 2 === 1;
          const bg = h.num === 0 ? '#00c853' : isRed ? '#ff1744' : '#212121';
          return (
            <View key={index} style={[styles.historyDot, { backgroundColor: bg }]}>
              <Text style={styles.historyText}>{h.num}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

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
            <Text style={styles.title}>ROULETTE</Text>
          </ImageBackground>
        </View>

        <View style={styles.wheelCard}>
          <RouletteWheel
            spinning={spinning}
            targetAngle={targetAngle}
            winningNumber={winningNumber}
          />
        </View>
        {resultText ? <Text style={styles.resultText}>{resultText}</Text> : null}

        <View style={styles.chipsBlock}>
          <Text style={styles.chipsLabel}>BET</Text>
          <ChipSelector selected={selectedChip} onSelect={setSelectedChip} />
        </View>

        <LinearGradient
          colors={['#050022', '#0b0130']}
          style={styles.tableWrapper}
        >
          <View style={styles.tableInner}>
            <View style={styles.rowZero}>
              <View style={styles.zeroCol}>
                {renderBetCell('0', 'straight', 0, {
                  backgroundColor: '#007f3b',
                })}
              </View>
              <View style={styles.numbersCol}>
                {[0, 1, 2].map((offset) => (
                  <View key={offset} style={styles.col}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((row) => {
                      const num = row * 3 + offset + 1;
                      if (num > 36) return null;
                      const isRed = num % 2 === 1;
                      return renderBetCell(String(num), 'straight', num, {
                        backgroundColor: isRed ? '#e53935' : '#161621',
                      });
                    })}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.dozenRow}>
              {renderBetCell('1st 12', 'dozen', 1)}
              {renderBetCell('2nd 12', 'dozen', 2)}
              {renderBetCell('3rd 12', 'dozen', 3)}
            </View>

            <View style={styles.outsideRow}>
              {renderBetCell('1 to 18', 'lowHigh', 'low')}
              {renderBetCell('EVEN', 'evenOdd', 'even')}
              {renderBetCell('RED', 'color', 'red', {
                backgroundColor: '#c62828',
              })}
              {renderBetCell('BLACK', 'color', 'black', {
                backgroundColor: '#111118',
              })}
              {renderBetCell('19 to 36', 'lowHigh', 'high')}
            </View>
          </View>
        </LinearGradient>

        <Text style={styles.totalBet}>Total bet: {totalBet} coins</Text>

        <View style={styles.controlsRow}>
          <NeonButton
            title="SPIN"
            onPress={handleSpin}
            disabled={bets.length === 0 || spinning}
            style={styles.controlBtn}
          />
          <NeonButton
            title="CLEAR"
            onPress={handleClear}
            disabled={bets.length === 0 || spinning}
            style={styles.controlBtn}
          />
          <NeonButton
            title="UNDO"
            onPress={handleUndo}
            disabled={bets.length === 0 || spinning}
            style={styles.controlBtn}
          />
        </View>

        <View style={styles.controlsRow}>
          <NeonButton
            title="REBET"
            onPress={handleRebet}
            disabled={lastBets.length === 0 || spinning}
            style={[styles.controlBtn, { flex: 1 }]}
          />
        </View>

        {renderHistory()}

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
    paddingHorizontal: 30,
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
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 6,
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
    marginTop: 2,
    marginBottom: 4,
  },
  chipsBlock: {
    marginTop: 4,
    marginBottom: 8,
  },
  chipsLabel: {
    color: '#ffffffaa',
    fontSize: 11,
    marginBottom: 2,
    textAlign: 'center',
  },
  tableWrapper: {
    borderRadius: 20,
    padding: 3,
    borderWidth: 2,
    borderColor: '#00ffff77',
    marginTop: 4,
  },
  tableInner: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: '#050013',
  },
  rowZero: {
    flexDirection: 'row',
  },
  zeroCol: {
    width: '19%',
  },
  numbersCol: {
    flex: 1,
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  betCell: {
    margin: 2,
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffffff33',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
    backgroundColor: '#161632',
  },
  betLabel: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  betChip: {
    position: 'absolute',
    bottom: 2,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffffdd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffca28',
    shadowColor: '#ffca28',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  betChipText: {
    color: '#3e2723',
    fontSize: 9,
    fontWeight: '900',
  },
  dozenRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  outsideRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  totalBet: {
    marginTop: 6,
    color: '#ffffffdd',
    textAlign: 'center',
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  controlBtn: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 24,
  },
  historyBlock: {
    marginTop: 10,
    alignItems: 'center',
  },
  historyTitle: {
    color: '#9fa8da',
    fontSize: 12,
    marginBottom: 4,
  },
  historyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  historyDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 3,
    marginVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffffaa',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  historyText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
  },
});
