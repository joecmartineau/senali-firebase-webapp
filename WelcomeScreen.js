import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const handleGetStarted = () => {
    // Handle button press - can be customized based on navigation needs
    console.log('Get Started button pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* App Name */}
        <Text style={styles.appName}>NeuroParent</Text>
        
        {/* Headline */}
        <Text style={styles.headline}>Guidance for Your Journey</Text>
        
        {/* Description */}
        <Text style={styles.description}>
          Personalized AI-powered support for parents of neurodivergent children.
        </Text>
        
        {/* Get Started Button */}
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#1E6A52', '#D4AF37']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  appName: {
    fontSize: Math.min(width * 0.12, 48),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  headline: {
    fontSize: Math.min(width * 0.06, 24),
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  description: {
    fontSize: Math.min(width * 0.045, 18),
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.065, 26),
    marginBottom: 40,
    paddingHorizontal: 10,
    maxWidth: width * 0.85,
  },
  buttonContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientButton: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: width * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default WelcomeScreen;