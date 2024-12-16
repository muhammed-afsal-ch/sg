import { useGlobalContext } from "@/context/Globalprovider";
import { Stack, router } from "expo-router";
import { useContext, useEffect } from "react";
import { BackHandler } from "react-native";

import { View, ActivityIndicator } from "react-native";

export default function ResultAddLayout() {
  const { user, loading } = useGlobalContext();

  //Handle back button press without alert
  useEffect(() => {
    const backAction = () => {
      router.back(); // Redirect to home screen or previous page
      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup the listener
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to the home screen if no user
      router.push("/home"); // Replace "/index" with your home screen route
    }
  }, [user, loading]);

  if (loading) {
    // Show a loading spinner while checking user status
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // If user is active, return the layout
  return (
    <Stack>
      <Stack.Screen name="addresult" options={{
        headerStyle: {
          backgroundColor: "#161622",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        title: "Add New Result",
      }} />
      <Stack.Screen name="createvideo" options={{
        headerStyle: {
        backgroundColor: "#161622",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
        fontWeight: "bold",
        },
        title: "Upload New Video",
      }}/>
 <Stack.Screen name="createpost" options={{
        headerStyle: {
        backgroundColor: "#161622",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
        fontWeight: "bold",
        },
        title: "Create New Post",
      }}/>
      <Stack.Screen name="[editresult]" options={{
        headerStyle: {
          backgroundColor: "#161622",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        title: "Edit Result",
      }} />

<Stack.Screen name="addtogallery" options={{
        headerStyle: {
        backgroundColor: "#161622",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
        fontWeight: "bold",
        },
        title: "Add To Gallery",
      }}/>

    </Stack>

  );
}


// import { Stack } from 'expo-router';

// export default function ResultAddLayout() {
//   return (
//     <Stack
//       screenOptions={{
//         headerStyle: {
//           backgroundColor: '#161622',
//         },
//         headerTintColor: '#fff',
//         headerTitleStyle: {
//           fontWeight: 'bold',
//         }, title:"Add New Result"
//       }}
//     />
//   );
// }
