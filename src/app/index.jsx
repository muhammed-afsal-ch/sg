import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { images } from "../constants";
import { CustomButton } from "../components";
import Animation from "@/components/Animation"; // Your animation component
import { getAllItems } from "@/utils/AsyncStorage";

const Welcome = () => {
  const [isFirstTime, setIsFirstTime] = useState(false); // Track first-time user
  const [showAnimation, setShowAnimation] = useState(false); // Track when to show animation

  useEffect(() => {
    const checkFirstTimeUser = async () => {
      const isFirstTimeOpen = await AsyncStorage.getItem("isFirstTimeOpen");
      if (!isFirstTimeOpen) {
        setIsFirstTime(true); // It's the first time, show the Welcome screen
        await AsyncStorage.setItem("isFirstTimeOpen", "false"); // Set flag after first time
      }
    };

    checkFirstTimeUser();
  }, []);

  useEffect(() => {
    if (!isFirstTime) {
      // If it's not the first time, show the animation
      setShowAnimation(true);

      const timer = setTimeout(() => {
        setShowAnimation(false); // Hide animation after 4 seconds
        router.push("/home"); // Navigate to the home screen after animation ends
      }, 4000); // 4 seconds duration for animation

      return () => clearTimeout(timer); // Clean up the timeout on unmount
    }
  }, [isFirstTime]);

  // If it's the first time, show onboarding
  if (isFirstTime) {
    router.push("/onboarding"); // Navigate to the onboarding screen
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      {/* If it's the first time, show the Welcome screen, else show the animation */}
      {isFirstTime ? (
        <ScrollView
          contentContainerStyle={{
            height: "100%",
          }}
        >
          <View className="w-full flex justify-center items-center h-full px-4">
            <Image
              source={images.logo4}
              className="w-[130px] h-[84px]"
              resizeMode="contain"
            />
            <Image
              source={images.motolg}
              className="max-w-[310px] w-full h-[250px]"
              resizeMode="contain"
            />

            <View className="relative mt-2">
              {/* Optional content */}
            </View>

            <Image
              source={images.sksm}
              className="w-[166px] h-[20px] "
              resizeMode="contain"
            />
            <Text className="text-gray-300 mt-2 text-sm"> 15th, State</Text>

            <Image
              source={images.sargatypog}
              className="w-[166px] h-[45px] "
              resizeMode="contain"
            />

            <View className="flex justify-center items-center flex-row mt-4 -mb-4">
              <Text className="mb-6 text-md font-medium font-amedium text-gray-100 mt-7 text-center">
                ഡിസംബർ{" "}
              </Text>

              <View className="flex flex-row gap-2">
                <View className="bg-blue-400 p-2 rounded-md">
                  <Text className="font-bold font-amedium text-white">
                    27
                  </Text>
                </View>
                <View className="bg-blue-400 p-2 rounded-md">
                  <Text className="font-bold font-amedium text-white">
                    28
                  </Text>
                </View>
                <View className="bg-blue-400 p-2 rounded-md">
                  <Text className="font-bold font-amedium text-white">
                    29
                  </Text>
                </View>
              </View>
            </View>

            <Text className="text-lg font-bold font-amedium text-gray-100 text-center">
              പ്രകാശ തീരം, കണ്ണൂർ{" "}
            </Text>

            <CustomButton
              title="Enter to Sargalayam"
              handlePress={async () => {
                await AsyncStorage.setItem("buttonClickedSplash", "true");
                setIsFirstTime(false); // Set flag to false to show animation in future
              }}
              containerStyles="w-full mt-7"
            />
          </View>
        </ScrollView>
      ) : (
        // Show animation if it's not the first time
        <>
          {showAnimation && <Animation />}
          <StatusBar backgroundColor="#161622" style="light" />
        </>
      )}
    </SafeAreaView>
  );
};

export default Welcome;
