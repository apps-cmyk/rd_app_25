import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CHIP_VALUES = [10, 50, 100, 500, 1000];

export default function ChipSelector({ selected, onSelect }) {
  return (
    <View style={styles.container}>
      {CHIP_VALUES.map((value, index) => {
        const isSelected = value === selected;

        const colors =
          index === 0
            ? ['#2196f3', '#00e5ff']
            : index === 1
            ? ['#3f51b5', '#7c4dff']
            : index === 2
            ? ['#9c27b0', '#e040fb']
            : index === 3
            ? ['#ff9800', '#ffc107']
            : ['#f44336', '#ff7043'];

        return (
          <Pressable
            key={value}
            onPress={() => onSelect && onSelect(value)}
            style={styles.pressable}
          >
            <LinearGradient
              colors={colors}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
              ]}
            >
              <View style={styles.chipInner}>
                <Text
                  style={[
                    styles.text,
                    value >= 1000 && styles.textSmall, 
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {value}
                </Text>
              </View>
            </LinearGradient>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginTop: 4,
  },
  pressable: {
    flex: 1,
    alignItems: 'center',
  },
  chip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#ffffffaa',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOpacity: 0.7,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  chipInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffffffdd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050016',
  },
  chipSelected: {
    borderColor: '#ffff8d',
    shadowColor: '#ffff8d',
    shadowRadius: 10,
  },
  text: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 11,
  },
  textSmall: {
    fontSize: 9, 
  },
});
