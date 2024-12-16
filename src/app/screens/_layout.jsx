import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { BackHandler } from "react-native";


export default function ScreensLayouts() {

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true; 
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove(); 
  }, []);

 
  return (
    <Stack>
      <Stack.Screen name="gallery" options={{
        headerStyle: {
          backgroundColor: "#161622",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        title: "Gallery",
      }} />

<Stack.Screen name="downloads" options={{
        headerStyle: {
          backgroundColor: "#161622",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        title: "Downloads",
      }} />

<Stack.Screen name="message" options={{
        headerStyle: {
          backgroundColor: "#161622",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        title: "Message Us",
      }} />

<Stack.Screen name="quiz" options={{
        headerStyle: {
          backgroundColor: "#161622",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        title: "Sargalayam Quiz",
      }} />
      
    </Stack>

  );
}


