import React, { useState, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export default function App() {
  // Animated value for the outer circle's scaling
  const scaleOuter = new Animated.Value(1);

  // Function to start the expanding effect of the outer circle
  const startExpandingEffect = () => {
    Animated.loop(
      Animated.sequence([
        // Outer circle expand
        Animated.timing(scaleOuter, {
          toValue: 2, // Scale the outer circle by 3x
          duration: 400,
          useNativeDriver: true,
        }),
        // Outer circle return to normal size
        Animated.timing(scaleOuter, {
          toValue: 1, // Reset outer circle to original size
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    startExpandingEffect();
  }, []);

  return (
    <View style={styles.container}>
      {/* Inner Circle */}
      <View style={styles.innerCircle} />

      {/* Outer Circle with Animation */}
      <Animated.View
        style={[
          styles.outerCircle,
          {
            transform: [{ scale: scaleOuter }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  innerCircle: {
    width: 17,
    height: 17,
    borderRadius: 50,
    backgroundColor: 'green',
    position: 'absolute', // Keeps it centered
  },
  outerCircle: {
    width: 18,
    height: 18,
    borderRadius: 100, // Makes it a circle
    backgroundColor: 'green',
    position: 'absolute', // Keeps it centered under the inner circle
    opacity: 0.3, // Makes the outer circle semi-transparent
  },
});
