import { useState } from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Alert, Image, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import the close icon
import ImageViewer from "react-native-image-zoom-viewer"; // Import ImageViewer
import { Video } from 'expo-av'; // Import for playing video

import { icons } from "@/constants";
import { createPost } from "@/lib/appwrite";
import { CustomButton, FormField } from "@/components";
import { useGlobalContext } from "../../context/Globalprovider";

const AddtoGallery = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [isModalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [currentFile, setCurrentFile] = useState(null); // State to store the clicked file (image or video)
  const [isVideoModal, setIsVideoModal] = useState(false); // State to toggle video playback in modal

  const openPicker = async () => {
    try {
      // Request media library permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", "You need to allow access to the media library.");
        return;
      }

      // Launch the image picker to allow multiple image/video selection
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
        allowsMultipleSelection: true, // Enable multiple selection
      });

      if (!result.canceled) {
        if (result.assets.length > 0) {
          // Limit to a maximum of 10 files (images + videos)
          const newFiles = result.assets.slice(0, 10); // Limit the number of files selected
          setSelectedFiles((prevSelectedFiles) => [
            ...prevSelectedFiles,
            ...newFiles,
          ]);
        }
      } else {
        Alert.alert("No file selected");
      }
    } catch (error) {
      console.error("Error selecting media:", error);
      Alert.alert("Error", "Something went wrong while selecting media.");
    }
  };

  // Function to remove a selected file
  const removeFile = (index) => {
    setSelectedFiles((prevSelectedFiles) => {
      const updatedFiles = prevSelectedFiles.filter((_, i) => i !== index);
      return updatedFiles;
    });
  };

  // Function to open the modal with the clicked file
  const openModal = (file) => {
    setCurrentFile(file.uri); // Set the clicked file
    setIsVideoModal(file.type === 'video'); // Check if it's a video or not
    setModalVisible(true); // Open the modal
  };

  // Function to close the modal
  const closeModal = () => {
    setModalVisible(false);
    setCurrentFile(null); // Reset the file
  };

  const submit = async () => {
    if (selectedFiles.length === 0) {
      return Alert.alert("Please select at least one file");
    }

    setUploading(true);
    try {
      // Upload selected files (you may need to create your upload function)
      await createPost(selectedFiles); // Assuming createPost takes the selected files

      Alert.alert("Success", "Files Uploaded successfully");
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSelectedFiles([]);
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold">Enter Details</Text>

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Images & Videos (max 10)
          </Text>

          <TouchableOpacity onPress={openPicker}>
            <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 flex justify-center items-center flex-row space-x-2">
              <Image source={icons.upload} resizeMode="contain" alt="upload" className="w-5 h-5" />
              <Text className="text-sm text-gray-100 font-pmedium">Choose files</Text>
            </View>
          </TouchableOpacity>

          <View className="mt-4 flex flex-wrap flex-row gap-2">
            {selectedFiles.map((file, index) => (
              <View key={index} className="relative">
                <TouchableOpacity onPress={() => openModal(file)}>
                  {file.type === "video" ? (
                    <Image
                      source={{ uri: file.uri }}
                      resizeMode="cover"
                      className="w-20 h-20 rounded-md"
                    />
                  ) : (
                    <Image
                      source={{ uri: file.uri }}
                      resizeMode="cover"
                      className="w-20 h-20 rounded-md"
                    />
                  )}
                </TouchableOpacity>
                {/* Close button to remove the file */}
                <TouchableOpacity
                  onPress={() => removeFile(index)}
                  className="absolute top-0 right-0 p-1 bg-white rounded-full"
                >
                  <Ionicons name="close-circle" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <CustomButton
          title="Submit & Publish"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>

      {/* Modal for Image Viewer or Video Player */}
      {isModalVisible && (
        <Modal visible={true} transparent={true} onRequestClose={closeModal} className="w-full" animationType="fade">
          {isVideoModal ? (
            <Video
              source={{ uri: currentFile }}
              style={{ width: '100%', height: '100%' }}
              useNativeControls
              resizeMode="contain"
              isLooping
              shouldPlay
            />
          ) : (
            <ImageViewer
              imageUrls={[{ url: currentFile }]} // Only show the clicked image
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
          )}
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default AddtoGallery;
