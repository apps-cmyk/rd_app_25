import React, { useRef } from 'react';
import { Pressable, Animated, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function NeonButton({ title, onPress, disabled, style }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 10,
    }).start();
  };

  return (
    <Pressable
      onPress={disabled ? null : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, disabled && { opacity: 0.5 }]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <LinearGradient
          colors={['#8514E8', '#B41885']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.text}>{title}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#ffffff55',
    shadowColor: '#ff00ff',
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 6,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
