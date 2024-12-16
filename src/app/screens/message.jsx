import React, { useRef, useMemo, useState } from 'react';
import { Text, StyleSheet, View, Image, TouchableOpacity, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { icons } from '@/constants';
import { router } from 'expo-router';
import { CustomButton, FormField } from '@/components';
import { saveMessage } from '@/lib/appwrite';

const Message = () => {

  const sheetRef = useRef(null);

  const snapPoints = useMemo(() => ["95%"], []);

  const [clicked, setClicked] = useState(false)
  const [errors, setErrors] = useState({});
  const [submitStarted, setSubmitStarted] = useState(false)


  const [form, setForm] = useState({
    name: "",
    mobile: "",
    message: "",
  });


  const validateForm = () => {
    const newErrors = {};

    if (!form.name) {
      newErrors.name = "Name is required";
    } else if (typeof form.name !== "string") {
      newErrors.name = "Name must be a text"; 
    }

    if (!form.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(form.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    if (!form.message) {
      newErrors.message = "Message is required";
    } else if (typeof form.message !== "string") {
      newErrors.message = "Message must be a text";
    }

    setErrors(newErrors); // Update errors state based on validation results
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };



  const sendMessage = async () => {
    if (validateForm()) {
      setSubmitStarted(true);

      try {
        await saveMessage({
          name: form.name,
          mobile: form.mobile,
          message: form.message,
        });

        Alert.alert("Success! ", "Your message has been sent to us, we will reach you soon, Thank you!");
        router.back()

      } catch (error) {
        console.log(error);
        Alert.alert("Message", "Something went wrong. Please try again.");
      }

      setSubmitStarted(false);
    }
  };



  return (
    <>
      <SafeAreaView className="bg-primary h-full">
        <GestureHandlerRootView>
          <BottomSheet
            ref={sheetRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            onChange={(index) => {
              console.log("handleSheetChange", index);
            }}
          >
            <KeyboardAwareScrollView>

              <BottomSheetView style={styles.contentContainer}>
                <View className="flex  items-end w-full justify-end">
                  <TouchableOpacity
                    onPress={() => {
                      setClicked(!clicked)
                      router.back()
                    }
                    }
                  >
                    <Image
                      source={icons.cancel}
                      className="w-[30px] h-[30px] -mt-10 -mr-5"
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>

                <Text className="text-4xl font-pbold mb-2">Message</Text>

                <FormField
                  title="Name"
                  titleStyles={"text-black"}
                  value={form.name}
                  placeholder="Enter Your Full Name"
                  handleChangeText={(e) => setForm({ ...form, name: e })}
                  otherStyles=""
                  error={errors.name}
                />

                <FormField
                  title="Mobile no:"
                  titleStyles={"text-black"}
                  value={form.mobile}
                  placeholder="Enter Your Whatsapp No"
                  handleChangeText={(e) => setForm({ ...form, mobile: e })}
                  otherStyles="mt-5"
                  keyboardType={"numeric"}
                  error={errors.mobile}
                />
                <FormField
                  title="Message"
                  titleStyles={"text-black"}
                  value={form.message}
                  placeholder="Type you message here..."
                  handleChangeText={(e) => setForm({ ...form, message: e })}
                  otherStyles="mt-5"
                  error={errors.message}
                />
                <CustomButton
                  title={submitStarted ? "Submitting..." : "Send Message"}
                  handlePress={sendMessage}
                  isLoading={submitStarted}
                  containerStyles={"w-full mt-7 mb-4"}
                />

              </BottomSheetView>
            </KeyboardAwareScrollView>
          </BottomSheet>
        </GestureHandlerRootView>
      </SafeAreaView>
    </>
  );
};

export default Message;



const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingTop: 200,

  },

  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',

  },
  contentCContainer: {
    backgroundColor: "white",
    padding: 36,
  },
});
