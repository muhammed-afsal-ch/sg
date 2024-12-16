import { useState } from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { icons } from "@/constants";
import { createPost, createVideo } from "@/lib/appwrite";
import { CustomButton, FormField } from "@/components";
import { useGlobalContext } from "../../context/Globalprovider";

const Create = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    thumbnail: null,
    caption: "",
  });

  const openPicker = async (selectType) => {
    try {
      // Request media library permissions
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Denied",
          "You need to allow access to the media library.",
        );
        return;
      }

      let result;

      // Launch the appropriate picker based on the type
      if (selectType === "image") {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });
      }  

      if (!result.canceled) {
        if (selectType === "image") {
          setForm((prevForm) => ({
            ...prevForm,
            thumbnail: result.assets[0], // Storing the selected image
          }));
        }
      } else {
        Alert.alert("No file selected");
      }
    } catch (error) {
      console.error("Error selecting media:", error);
      Alert.alert("Error", "Something went wrong while selecting media.");
    }
  };

  const submit = async () => {
    if (
      !form.thumbnail 
    ) {
      return Alert.alert("Please provide all fields");
    }

    setUploading(true);
    try {
      await createPost({
        ...form,
       // userId: user.$id,
      });

      Alert.alert("Success", "Post uploaded successfully");
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setForm({
        thumbnail: null,
        caption: "",
      });

      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold">Enter Details</Text>

        

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Post Image
          </Text>

          <TouchableOpacity onPress={() => openPicker("image")}>
            {form.thumbnail ? (
              <Image
                source={{ uri: form.thumbnail.uri }}
                resizeMode="cover"
                className="w-full h-64 rounded-2xl"
              />
            ) : (
              <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 flex justify-center items-center flex-row space-x-2">
                <Image
                  source={icons.upload}
                  resizeMode="contain"
                  alt="upload"
                  className="w-5 h-5"
                />
                <Text className="text-sm text-gray-100 font-pmedium">
                  Choose a file
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FormField
          title="Post caption"
          value={form.caption}
          placeholder="The caption of post image...."
          handleChangeText={(e) => setForm({ ...form, caption: e })}
          otherStyles="mt-7"
        />

        <CustomButton
          title="Submit & Publish"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;
