import { Redirect, Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BackHandler } from "react-native";

import { Loader } from "../../components";
import { useGlobalContext } from "../../context/Globalprovider";
import { useEffect } from "react";

const AuthLayout = () => {
  const { loading, isLogged } = useGlobalContext();

 if (!loading && isLogged) return <Redirect href="/home" />;

 useEffect(() => {
  const backAction = () => {
    router.replace("/home"); // Redirect to home screen or previous page
    return true; // Prevent default back action
  };

  const backHandler = BackHandler.addEventListener(
    "hardwareBackPress",
    backAction
  );

  return () => backHandler.remove(); // Cleanup the listener
}, []);

  return (
    <>
      <Stack>
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
          }}
        />
        {/* <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false,
          }}
        /> */}
      </Stack>

      <Loader isLoading={loading} />
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default AuthLayout;