import { useState } from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Alert, Image, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import the close icon
import ImageViewer from "react-native-image-zoom-viewer"; // Import ImageViewer

import { icons } from "@/constants";
import { createPost, createVideo } from "@/lib/appwrite";
import { CustomButton, FormField } from "@/components";
import { useGlobalContext } from "../../context/Globalprovider";

const Create = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    thumbnails: [], // Changed to an array to hold multiple images
    caption: "",
  });
  const [isModalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [currentImage, setCurrentImage] = useState(null); // State to store the image clicked

  const openPicker = async () => {
    try {
      // Request media library permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", "You need to allow access to the media library.");
        return;
      }

      // Launch the image picker to allow multiple image selection
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsMultipleSelection: true, // Enable multiple selection
      });

      if (!result.canceled) {
        if (result.assets.length > 0) {
          // Limit to a maximum of 10 images
          const newThumbnails = [...form.thumbnails, ...result.assets.slice(0, 10 - form.thumbnails.length)];
          setForm((prevForm) => ({
            ...prevForm,
            thumbnails: newThumbnails,
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

  // Function to remove a selected image
  const removeImage = (index) => {
    setForm((prevForm) => {
      const updatedThumbnails = prevForm.thumbnails.filter((_, i) => i !== index);
      return {
        ...prevForm,
        thumbnails: updatedThumbnails,
      };
    });
  };

  // Function to open the modal with the clicked image
  const openModal = (image) => {
    setCurrentImage(image.uri); // Set the clicked image
    setModalVisible(true); // Open the modal
  };

  // Function to close the modal
  const closeModal = () => {
    setModalVisible(false);
    setCurrentImage(null); // Reset the image
  };

  const submit = async () => {
    if (!form.thumbnails.length) {
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
        thumbnails: [],
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
            Post Images (max 10)
          </Text>

          <TouchableOpacity onPress={openPicker}>
            <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 flex justify-center items-center flex-row space-x-2">
              <Image source={icons.upload} resizeMode="contain" alt="upload" className="w-5 h-5" />
              <Text className="text-sm text-gray-100 font-pmedium">Choose files</Text>
            </View>
          </TouchableOpacity>

          <View className="mt-4 flex flex-wrap flex-row gap-2">
            {form.thumbnails.map((image, index) => (
              <View key={index} className="relative">
                <TouchableOpacity onPress={() => openModal(image)}>
                  <Image
                    source={{ uri: image.uri }}
                    resizeMode="cover"
                    className="w-20 h-20 rounded-md"
                  />
                </TouchableOpacity>
                {/* Close button to remove the image */}
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute top-0 right-0 p-1 bg-white rounded-full"
                >
                  <Ionicons name="close-circle" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
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

      {/* Modal for Image Viewer */}
      {isModalVisible && (
        <Modal visible={true} transparent={true} onRequestClose={closeModal} className="w-full" animationType="fade">
          <ImageViewer
            imageUrls={[{ url: currentImage }]} // Only show the clicked image
            renderIndicator={() => null}
            saveToLocalByLongPress={false}
            renderHeader={() => (
              <TouchableOpacity
                onPress={closeModal}
                style={{
                  position: 'absolute',
                  top: 40,
                  right: 20,
                  backgroundColor: "black",
                  borderRadius: 50,
                  padding: 10,
                  zIndex: 2,
                }}
              >
                <Image source={icons.closex} className="w-8 h-8 rounded-full " resizeMode="contain" />
              </TouchableOpacity>
            )}
            enableSwipeDown={true}
            onSwipeDown={closeModal}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default Create;
