import { images } from '@/constants';
import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';

export default function App() {
  // Create an animated value for scale
  const scale = useRef(new Animated.Value(1)).current;

  // Function to start zoom-in and zoom-out animation
  useEffect(() => {
    // Loop animation for zoom in and zoom out
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 2, // Zoom in (scale to 2x)
          duration: 1000, // duration for zoom-in
          useNativeDriver: true, // use native driver for better performance
        }),
        Animated.timing(scale, {
          toValue: 1, // Zoom out (scale to 1x)
          duration: 1000, // duration for zoom-out
          useNativeDriver: true, // use native driver for better performance
        }),
      ])
    ).start(); // Start the animation loop
  }, [scale]);

  return (
    <View style={styles.container} className='bg-primary'>

      {/* Animated image with zooming effect */}
      <Animated.View style={[styles.imageContainer, { transform: [{ scale }] }]}>
        <View className='border border-1 border-green-200 p-1 rounded-full 	'>
          <View className='border border-2 border-green-200 rounded-full p-2 bg-green-400'>
            <Image
              source={images.motolg} // Replace with your image URL
              style={[styles.image, { tintColor: '#232533' }]}
              className='w-[35px] h-[35px]'
              resizeMode='contain'
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageContainer: {
    overflow: 'hidden', // Keeps image within bounds when zoomed
    marginBottom: 30,
  },

});
