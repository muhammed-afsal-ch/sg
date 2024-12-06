import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import AppIntroSlider from 'react-native-app-intro-slider'; // Use AppIntroSlider for slides
import { images } from '@/constants'; // Assuming images are imported correctly
import { router } from 'expo-router';

const slides = [
  {
    key: '1',
    title: 'Welcome!',
    text: 'This is our sargalayam app.',
    image: images.motolg,
    backgroundColor: '#22bcb5',
  },
  {
    key: '2',
    title: 'Features',
    text: 'It has many features!',
    image: images.motolg,
    backgroundColor: '#febe29',
  },
  {
    key: '3',
    title: 'Get Started',
    text: 'Let’s get started!',
    image: images.motolg,
    backgroundColor: '#22bcb5',
  }
];

const OnboardingScreen = ({ navigation }) => {
  const [isFirstTime, setIsFirstTime] = useState(true);

  useEffect(() => {
    // Check if onboarding has been seen before
    const checkFirstTimeUser = async () => {
      const onboardingSeen = await AsyncStorage.getItem('onboardingSeen');
      if (onboardingSeen === 'true') {
        setIsFirstTime(false); // It's not the first time, skip onboarding
         router.replace('/home')
      } else {
        setIsFirstTime(true);
      }
    };

    checkFirstTimeUser();
  }, []);

  const handleOnboardingDone = async () => {
    await AsyncStorage.setItem('onboardingSeen', 'true'); // Mark onboarding as completed
     router.replace('/home')
  };

  const renderSlide = ({ item }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  const renderDoneButton = () => (
    <TouchableOpacity onPress={handleOnboardingDone} style={styles.doneButton}  >
      <Text style={styles.doneButtonText}>Done</Text>
    </TouchableOpacity>
  );

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderSlide}
      renderDoneButton={renderDoneButton}
      onDone={handleOnboardingDone}
    />
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
    marginHorizontal: 20,
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OnboardingScreen;
