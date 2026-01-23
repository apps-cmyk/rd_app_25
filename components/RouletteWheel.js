import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ROULETTE_NUMBERS, ROULETTE_COLORS } from '../utils/rouletteLogic';

const WHEEL_SIZE = 220;
const OUTER_SIZE = 240;
const RADIUS = 92;       
const SEG_W = 12;
const SEG_H = 22;
const INNER_SIZE = 150;  
const CENTER_SIZE = 60;  

export default function RouletteWheel({ spinning, targetAngle, winningNumber }) {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (spinning) {
      spinAnim.setValue(0);
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2600,
        useNativeDriver: true,
      }).start();
    }
  }, [spinning, targetAngle]);

  const rotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${targetAngle}deg`],
  });

  const anglePer = 360 / ROULETTE_NUMBERS.length;

  return (
    <View style={styles.wrapper}>
      <View style={styles.pointerContainer}>
        <View style={styles.pointer} />
      </View>

      <LinearGradient
        colors={['#3b00ff', '#00e5ff']}
        style={styles.outerGlow}
      >
        <View style={styles.outerRing}>
          <Animated.View
            style={[styles.wheel, { transform: [{ rotate: rotation }] }]}
          >
            {ROULETTE_NUMBERS.map((num, index) => {
              const color = ROULETTE_COLORS[num];
              const angle = index * anglePer;

              const bg =
                num === 0
                  ? '#00c853'
                  : color === 'red'
                  ? '#ff3055'
                  : '#11111a';

              return (
                <View
                  key={num}
                  style={[
                    styles.segmentWrapper,
                    {
                      transform: [
                        { rotate: `${angle}deg` },
                        { translateY: -RADIUS },
                      ],
                    },
                  ]}
                >
                  <View style={[styles.segment, { backgroundColor: bg }]}>
                    <Text
                      style={styles.segmentLabel}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {num}
                    </Text>
                  </View>
                </View>
              );
            })}

            <LinearGradient
              colors={['#1a0042', '#050016']}
              style={styles.innerDisk}
            />

            <View style={styles.centerCircle}>
              <View style={styles.centerInner} />
            </View>
          </Animated.View>
        </View>
      </LinearGradient>

      {typeof winningNumber === 'number' && (
        <Text style={styles.resultLabel}>Number {winningNumber}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginTop: 4,
  },

  pointerContainer: {
    position: 'absolute',
    top: 8,
    zIndex: 5,
    alignSelf: 'center',
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ffd700',
  },

  outerGlow: {
    padding: 6,
    borderRadius: 999,
    marginTop: 26,
  },
  outerRing: {
    width: OUTER_SIZE,
    height: OUTER_SIZE,
    borderRadius: OUTER_SIZE / 2,
    backgroundColor: '#050010',
    alignItems: 'center',
    justifyContent: 'center',
  },

  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    borderWidth: 3,
    borderColor: '#ffffff33',
    backgroundColor: '#080019',
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  segmentWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: SEG_W,
    height: SEG_H,
    marginLeft: -SEG_W / 2,
    marginTop: -SEG_H / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLabel: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 7,
  },

  innerDisk: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: INNER_SIZE,
    height: INNER_SIZE,
    marginLeft: -INNER_SIZE / 2,
    marginTop: -INNER_SIZE / 2,
    borderRadius: INNER_SIZE / 2,
  },

  centerCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    marginLeft: -CENTER_SIZE / 2,
    marginTop: -CENTER_SIZE / 2,
    borderRadius: CENTER_SIZE / 2,
    borderWidth: 3,
    borderColor: '#5b2dff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15003a',
  },
  centerInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#7b3bff',
  },

  resultLabel: {
    color: '#ffd700',
    marginTop: 4,
    fontWeight: '600',
  },
});
