import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

const WHEEL_SIZE = 230;          
const OUTER_SIZE = 260;          
const RADIUS = WHEEL_SIZE / 2;   

export default function FortuneWheel({
  spinning,
  targetAngle,
  selectedIndex,
  segments = [],
}) {
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

  const count = segments.length || 1;
  const angleStepRad = (2 * Math.PI) / count;
  const baseAngle = Math.PI / 2;

  const renderSlices = () => {
    return segments.map((seg, index) => {
      const startAngle = baseAngle + index * angleStepRad - angleStepRad / 2;
      const endAngle = baseAngle + index * angleStepRad + angleStepRad / 2;
      const midAngle = (startAngle + endAngle) / 2;

      const x1 = RADIUS * Math.cos(startAngle);
      const y1 = RADIUS * Math.sin(startAngle);
      const x2 = RADIUS * Math.cos(endAngle);
      const y2 = RADIUS * Math.sin(endAngle);

      const rLabel = RADIUS * 0.6;
      const lx = rLabel * Math.cos(midAngle);
      const ly = rLabel * Math.sin(midAngle);

      const path = `
        M 0 0
        L ${x1} ${y1}
        A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2}
        Z
      `;

      const color = seg.color || defaultColors[index % defaultColors.length];

      return (
        <React.Fragment key={index}>
          <Path d={path} fill={color} />
          <SvgText
            x={lx}
            y={ly}
            fill="#ffffff"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {seg.label}
          </SvgText>
        </React.Fragment>
      );
    });
  };

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
            style={[styles.wheelContainer, { transform: [{ rotate: rotation }] }]}
          >
            <Svg
              width={WHEEL_SIZE}
              height={WHEEL_SIZE}
              viewBox={[-RADIUS, -RADIUS, WHEEL_SIZE, WHEEL_SIZE].join(' ')}
            >
              {renderSlices()}
            </Svg>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}

const defaultColors = [
  '#29b6f6',
  '#ffb74d',
  '#81c784',
  '#ba68c8',
  '#ef5350',
  '#4db6ac',
  '#ff8a65',
  '#9575cd',
];

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

  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    borderWidth: 3,
    borderColor: '#ffffff26',
    backgroundColor: '#080019',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
