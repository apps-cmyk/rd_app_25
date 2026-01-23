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
import GlobalBackground from '../components/GlobalBackground';
import { useGameState } from '../context/GameStateContext';

import TitleBg from '../assets/sc_bg.png';

const COIN_PACKS = [
  { id: 'p1', coins: 1000, gems: 5 },
  { id: 'p2', coins: 5000, gems: 20 },
  { id: 'p3', coins: 20000, gems: 60 },
  { id: 'p4', coins: 50000, gems: 120 },
];

export default function ShopScreen() {
  const { state, addCoins, addGems } = useGameState();
  const [message, setMessage] = useState('');

  if (!state) return null;

  const gems = state.gems || 0;

  const handleBuyPack = (pack) => {
    if (gems < pack.gems) {
      setMessage('Not enough gems to buy this pack.');
      return;
    }

    if (typeof addGems === 'function') {
      addGems(-pack.gems);
    }
    addCoins(pack.coins);

    setMessage(
      `Purchased ${pack.coins.toLocaleString()} coins for ${pack.gems} gems!`
    );
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
            <Text style={styles.title}>COIN PACKS</Text>
          </ImageBackground>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Buy coins for gems</Text>
          <Text style={styles.sectionSubtitle}>
            All purchases are virtual. No real money.
          </Text>
        </View>

        {COIN_PACKS.map((pack) => {
          const canAfford = gems >= pack.gems;
          return (
            <LinearGradient
              key={pack.id}
              colors={['#0a0224', '#12043a']}
              style={styles.packCard}
            >
              <View style={styles.packLeft}>
                <Text style={styles.packCoins}>
                  {pack.coins.toLocaleString()} COINS
                </Text>
                <Text style={styles.packGems}>Cost: {pack.gems} GEMS</Text>
              </View>

              <View style={styles.packRight}>
                <Pressable
                  onPress={() => handleBuyPack(pack)}
                  disabled={!canAfford}
                  style={({ pressed }) => [
                    styles.buyButton,
                    !canAfford && styles.buyButtonDisabled,
                    pressed && canAfford && styles.buyButtonPressed,
                  ]}
                >
                  <Text
                    style={styles.buyButtonText}
                    numberOfLines={1}
                    ellipsizeMode="clip"
                  >
                    BUY
                  </Text>
                </Pressable>
                {!canAfford && (
                  <Text style={styles.notEnoughText}>Not enough gems</Text>
                )}
              </View>
            </LinearGradient>
          );
        })}

        {message ? <Text style={styles.messageText}>{message}</Text> : null}

        <View style={{ height: 24 }} />
      </ScrollView>
    </GlobalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  titleWrapper: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
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
  sectionHeader: {
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#90a4ae',
    fontSize: 11,
    marginTop: 2,
  },
  packCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#00e5ff55',
  },
  packLeft: {
    flex: 2,
  },
  packRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  packCoins: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  packGems: {
    color: '#ffca28',
    fontSize: 13,
    marginTop: 2,
  },
  buyButton: {
    minWidth: 80,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ff3bff',
    backgroundColor: '#1a0033',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff3bff',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  buyButtonDisabled: {
    opacity: 0.4,
    shadowOpacity: 0.1,
  },
  buyButtonPressed: {
    transform: [{ scale: 0.96 }],
    shadowOpacity: 0.4,
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  notEnoughText: {
    color: '#ef9a9a',
    fontSize: 10,
    marginTop: 4,
  },
  messageText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#c5e1a5',
    fontSize: 12,
  },
});
