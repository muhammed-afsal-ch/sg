
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const slides = [
  {
    key: 'one',
    title: 'Welcome!',
    text: 'This is our awesome app.',
    image: require('../assets/slide1.png'),
    backgroundColor: '#22bcb5',
  },
  {
    key: 'two',
    title: 'Features',
    text: 'It has many features!',
    image: require('../assets/slide2.png'),
    backgroundColor: '#febe29',
  },
  {
    key: 'three',
    title: 'Get Started',
    text: 'Let’s get started!',
    image: require('../assets/slide3.png'),
    backgroundColor: '#22bcb5',
  }
];

export default function OnboardingScreen({ navigation }) {
  const [showRealApp, setShowRealApp] = useState(false);

  // Check if the user has seen the onboarding before
  useEffect(() => {
    const checkIfOnboardingSeen = async () => {
      const onboardingSeen = await AsyncStorage.getItem('onboardingSeen');
      if (onboardingSeen === 'true') {
        setShowRealApp(true);
      }
    };

    checkIfOnboardingSeen();
  }, []);

  // Handle the onboarding completion
  const handleOnboardingDone = async () => {
    await AsyncStorage.setItem('onboardingSeen', 'true'); // Save that onboarding has been shown
    setShowRealApp(true);
  };

  // If the user has already seen the onboarding, navigate to the home screen
  if (showRealApp) {
    return (
      <View style={styles.container}>
        <Text>Welcome to the app!</Text>
        <Button title="Go to Home" onPress={() => navigation.navigate('Home')} />
      </View>
    );
  } else {
    return (
      <AppIntroSlider
        slides={slides}
        onDone={handleOnboardingDone}
        renderNextButton={() => <Button title="Next" />}
        renderDoneButton={() => <Button title="Done" />}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
