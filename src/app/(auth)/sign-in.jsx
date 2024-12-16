import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { getCurrentUser, signIn } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/Globalprovider";
import { router } from "expo-router";

const SignIn = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async () => {
    const { email, password } = form;

    // Check if fields are empty
    if (!email || !password) {
      return Alert.alert("Error", "Please fill in all fields");
    }

    setIsSubmitting(true);

    try {
      await signIn(email, password); 
      const user = await getCurrentUser(); 

      setUser(user); 
      setIsLogged(true); 

      Alert.alert("Success", "Admin signed in successfully");
      router.replace("/home"); 
    } catch (error) {
      Alert.alert("Error", error?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View
          className="w-full flex justify-center h-full px-6 my-6"
          style={{ minHeight: Dimensions.get("window").height - 100 }}
        >
         
          <Image
            source={images.sargalayamlogo}
            resizeMode="contain"
            className="w-[115px] h-[74px] -ml-5 rounded-lg"
          />

  
          <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
            Log in to Sargalayam
          </Text>

        
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(value) => handleInputChange("email", value)}
            otherStyles="mt-7"
            keyboardType="email-address"
            placeholder="Enter your email"
          />

  
          <FormField
            title="Password"
             value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
                otherStyles="mt-7"
               placeholder={'Enter your password'}
            />

 
          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
