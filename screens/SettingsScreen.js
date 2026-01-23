import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BalanceBar from '../components/BalanceBar';
import NeonButton from '../components/NeonButton';
import GlobalBackground from '../components/GlobalBackground';
import { useGameState } from '../context/GameStateContext';

import TitleBg from '../assets/sc_bg.png';

const KEY_PLAYER_NAME = '@settings_player_name';

export default function SettingsScreen() {
  const game = useGameState();
  const { state, updatePlayerName } = game || {};

  const initialName =
    state?.playerName || state?.nickname || state?.profileName || 'Guest';

  const [playerName, setPlayerName] = useState(initialName);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const storedName = await AsyncStorage.getItem(KEY_PLAYER_NAME);
        if (storedName) {
          setPlayerName(storedName);
        }
      } catch (e) {
        console.warn('Failed to load player name from settings', e);
      }
    })();
  }, []);

  const handleSave = async () => {
    const trimmed = playerName.trim();
    if (!trimmed) {
      setStatusMessage('Name cannot be empty.');
      return;
    }
    if (trimmed.length > 16) {
      setStatusMessage('Name is too long (max 16 characters).');
      return;
    }

    try {
      await AsyncStorage.setItem(KEY_PLAYER_NAME, trimmed);

      if (typeof updatePlayerName === 'function') {
        updatePlayerName(trimmed);
      }

      setStatusMessage('Settings saved successfully.');
    } catch (e) {
      console.warn('Failed to save settings', e);
      setStatusMessage('Error while saving settings.');
    }

    setTimeout(() => {
      setStatusMessage('');
    }, 2500);
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
            <Text style={styles.title}>SETTINGS</Text>
          </ImageBackground>
        </View>

        <LinearGradient colors={['#0a0224', '#12043a']} style={styles.card}>
          <Text style={styles.cardTitle}>Profile</Text>
          <Text style={styles.label}>Player name</Text>
          <View style={styles.inputWrapper}>
            <LinearGradient
              colors={['#ff3bff55', '#00e5ff55']}
              style={styles.inputBorder}
            >
              <View style={styles.inputInner}>
                <TextInput
                  value={playerName}
                  onChangeText={setPlayerName}
                  placeholder="Enter your name"
                  placeholderTextColor="#757575"
                  style={styles.textInput}
                  maxLength={20}
                />
              </View>
            </LinearGradient>
          </View>
          <Text style={styles.helperText}>
            This name is shown in the lobby and game screens.
          </Text>
        </LinearGradient>

        <LinearGradient colors={['#0a0224', '#12043a']} style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.aboutText}>
            This is a social casino game. All currency in the game is virtual
            and has no real-world value. No real money is used or won.
          </Text>
          <Text style={styles.aboutText}>Version: 1.0.0</Text>
        </LinearGradient>

        <View style={styles.saveWrapper}>
          <NeonButton
            title="SAVE SETTINGS"
            onPress={handleSave}
            style={styles.saveButton}
          />
          {statusMessage ? (
            <Text style={styles.statusText}>{statusMessage}</Text>
          ) : null}
        </View>

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
    marginBottom: 8,
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
  card: {
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#00e5ff55',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  label: {
    color: '#cfd8dc',
    fontSize: 12,
    marginBottom: 4,
  },
  inputWrapper: {
    marginBottom: 4,
  },
  inputBorder: {
    borderRadius: 14,
    padding: 1.5,
  },
  inputInner: {
    borderRadius: 12,
    backgroundColor: '#040010',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  textInput: {
    color: '#ffffff',
    fontSize: 14,
  },
  helperText: {
    color: '#90a4ae',
    fontSize: 11,
    marginTop: 4,
  },
  aboutText: {
    color: '#b0bec5',
    fontSize: 12,
    marginTop: 4,
  },
  saveWrapper: {
    marginTop: 16,
    alignItems: 'center',
  },
  saveButton: {
    borderRadius: 24,
    paddingHorizontal: 24,
  },
  statusText: {
    marginTop: 6,
    fontSize: 12,
    color: '#c5e1a5',
    textAlign: 'center',
  },
});
