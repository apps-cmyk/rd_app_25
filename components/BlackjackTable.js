import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function renderCard(card, index) {
  if (!card) return null;
  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <View key={index} style={styles.card}>
      <Text style={[styles.cardText, isRed && { color: '#ff4b81' }]}>
        {card.rank}{card.suit}
      </Text>
    </View>
  );
}

export default function BlackjackTable({ dealerHand, playerHand, hideDealerHole, suggestion }) {
  const visibleDealerHand = hideDealerHole && dealerHand.length > 0
    ? [dealerHand[0], { rank: '?', suit: '?' }]
    : dealerHand;

  return (
    <View style={styles.container}>
      <View style={styles.handRow}>
        <Text style={styles.label}>Dealer</Text>
        <View style={styles.cardsRow}>
          {visibleDealerHand.map(renderCard)}
        </View>
      </View>
      <View style={styles.separator} />
      <View style={styles.handRow}>
        <Text style={styles.label}>You</Text>
        <View style={styles.cardsRow}>
          {playerHand.map(renderCard)}
        </View>
      </View>
      {suggestion && (
        <Text style={styles.suggestion}>Suggested: {suggestion}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#0c1624',
    borderWidth: 2,
    borderColor: '#00f5ff55',
  },
  handRow: {
    marginVertical: 8,
  },
  label: {
    color: '#ffffffcc',
    fontSize: 14,
    marginBottom: 4,
  },
  cardsRow: {
    flexDirection: 'row',
  },
  card: {
    width: 50,
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffffff88',
    backgroundColor: '#1a2740',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cardText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: '#ffffff22',
    marginVertical: 10,
  },
  suggestion: {
    marginTop: 8,
    color: '#00f5ff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
