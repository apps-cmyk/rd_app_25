import React, { useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import GlobalBackground from '../components/GlobalBackground';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Lobby');
    }, 2200);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <GlobalBackground>
      <View style={styles.container}>
        <Text style={styles.logo}>Noir Casiro</Text>
        <Text style={styles.subtitle}>Social Casino • Play for Fun</Text>
      </View>
    </GlobalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    color: 'white',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: '#ff00ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    marginTop: 12,
    color: '#ffffffaa',
    fontSize: 14,
  },
});
