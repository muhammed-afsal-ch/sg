import { images } from "@/constants";
import React, { useState, useEffect } from "react";
import { View, Animated, Image, Dimensions, Easing } from "react-native";

const { width, height } = Dimensions.get("window");

const AnimatedImage = () => {
  const [rotateX] = useState(new Animated.Value(0)); // For rotating X axis
  const [rotateY] = useState(new Animated.Value(0)); // For rotating Y axis
  const [scale] = useState(new Animated.Value(1)); // For zooming in and out
  const [glow] = useState(new Animated.Value(0)); // For glowing effect

  // Start the animation (rotation + zoom + glow)
  useEffect(() => {
    Animated.loop(
        
      Animated.sequence([
        // Zoom in
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        // Zoom out
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        // Rotate X and Y axis
        Animated.parallel([
          Animated.timing(rotateX, {
            toValue: 360,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(rotateY, {
            toValue: 360,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        // Glowing effect
        Animated.sequence([
          // Increase glow
          Animated.timing(glow, {
            toValue: 1,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          // Decrease glow
          Animated.timing(glow, {
            toValue: 0,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [rotateX, rotateY, scale, glow]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Animated.View
        style={{
          width: 200,
          height: 200,
          transform: [
            { perspective: 1000 }, // Adds perspective for 3D effect
            { rotateX: rotateX.interpolate({ inputRange: [0, 360], outputRange: ["0deg", "360deg"] }) },
            { rotateY: rotateY.interpolate({ inputRange: [0, 360], outputRange: ["0deg", "360deg"] }) },
            { scale },
          ],
          // Glow effect: changing the shadow and border width
          shadowColor: glow.interpolate({
            inputRange: [0, 1],
            outputRange: ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.8)"], // White glowing effect
          }),
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: glow.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 20], // Increased radius for glowing effect
          }),
          shadowOpacity: glow.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1], // Full opacity for glow
          }),
          borderWidth: glow.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 5], // Border width increases when glowing
          }),
          borderColor: glow.interpolate({
            inputRange: [0, 1],
            outputRange: ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 1)"], // White border color when glowing
          }),
        }}
      >
        <Image
          source={images.motolg}  // Replace with your image URL or local image
          style={{ width: 200, height: 200 }}
        />
      </Animated.View>
    </View>
  );
};

export default AnimatedImage;
