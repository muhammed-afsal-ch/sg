import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert, Modal, ActivityIndicator } from "react-native";
import ImageViewer from 'react-native-image-zoom-viewer';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { useGlobalContext } from "@/context/Globalprovider";
import { shareAsync } from 'expo-sharing'; // Import shareAsync for sharing functionality

import { icons } from "../constants";
import { router } from "expo-router";

const VideoCard = ({ item_code, item_name, category, thumbnail }) => {

  const categoriesName = {
    'G.K': 'General Kiddies',
    'G.SJ': 'General Sub Junior',
    'G.J': 'General Junior',
    'G.S': 'General Senior',
    'G.SS': 'General Super Senior',
    'G.G': 'General Group',
    'T.J': 'Twalaba Junior',
    'T.S': 'Twalaba Senior',
    'T.G': 'Twalaba Group'
  };
  
  const { user } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
   const [imageHeight, setImageHeight] = useState(0); // Default height

   useEffect(() => {
    // Get the image dimensions to calculate the height based on its aspect ratio
    Image.getSize(thumbnail, (width, height) => {
      // Calculate the aspect ratio
      const aspectRatio = height / width;
      
      // Assuming you want to use the full screen width, set the width to 'w-full' (full width of the container)
      const screenWidth = 375; // Or use `Dimensions.get('window').width` to get the dynamic screen width
      const calculatedHeight = screenWidth * aspectRatio;
      
      setImageHeight(calculatedHeight); // Set the height based on the aspect ratio
    });
  }, [thumbnail]);

  const handleShare = async () => {
    setIsLoading(true);

    try {
      // Step 1: Download the image to local file system
      const fileUri = FileSystem.documentDirectory + `${item_code}-${item_name}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(thumbnail, fileUri);
      setIsLoading(false);

      // Step 2: Share image with a caption
      await shareAsync(downloadResult.uri, {
        message: `Check out this item: ${item_name}\nCategory: ${category}`, // This is the caption you want to share
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error sharing image:", error);
      Alert.alert("Error", "Failed to share image.");
      setIsLoading(false);
    }
  };

  async function saveFile(uri, filename, mimetype) {
    if (Platform.OS === "android") {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

        try {
          const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            filename,
            mimetype || "application/octet-stream" // Provide a fallback MIME type
          );

          await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
          Alert.alert("Success", "File saved successfully!");
        } catch (error) {
          console.error("Error saving file:", error);
          Alert.alert("Error", "Failed to save file.");
        }
      } else {
        shareAsync(uri); // Fallback to sharing if permissions are not granted
      }
    } else {
      shareAsync(uri); // Fallback for non-Android platforms
    }
  }

  async function download() {
    setIsLoading(true);

    const filename = `${item_code}-${item_name}.jpg`;
    try {
      const result = await FileSystem.downloadAsync(
        thumbnail,
        FileSystem.documentDirectory + filename
      );

      const mimetype = result.headers["Content-Type"] || "application/octet-stream";
      saveFile(result.uri, filename, mimetype); // Pass the correct MIME type
      setIsLoading(false);
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert("Download Failed", "There was an issue downloading the file.");
      setIsLoading(false);
    }
  }

  const images = [{
    url: thumbnail,
    props: {
      enableSwipeDown: true,
    }
  }];

  const closeModal = () => {
    setIsModalVisible(false); // Close the modal
  };

  const handleDownloadPress = () => {
    download(); // Download the image when the button is pressed
  };

  return (
    <View className="flex flex-col items-center px-4 mb-14">
      <View className="flex flex-row gap-3 items-start justify-center ">
        <View className="flex justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
            <View className="bg-white w-[39px] h-[39px] rounded-lg flex justify-center items-center">
              <Text className="font-pesemibold text-xl ">{item_code}</Text>
            </View>
          </View>

          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="font-psemibold text-sm text-white"
              numberOfLines={1}
            >
              {item_name}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {categoriesName[category]}
            </Text>
          </View>
        </View>

        <View className=" flex flex-row">
          <TouchableOpacity onPress={download}>
          <View className="p-4 rounded-full">
            <Image source={icons.download} className="w-5 h-5" resizeMode="contain" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare}>
          <View className="p-4 rounded-full">
            <Image source={icons.share} className="w-5 h-5" resizeMode="contain" />
            </View>
          </TouchableOpacity>

          {user && (
            <TouchableOpacity
              onPress={() => {
                router.push(`/admin/${item_code}`)
              }}
            >
              <View className="p-4 rounded-full">
              <Image source={icons.edit} className="w-5 h-5" resizeMode="contain" />
            </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && (
        <View
          style={{
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 1000,
          }}
        >
          <ActivityIndicator size="large" color="#3178f4" />
        </View>
      )}

      {isModalVisible && (
        <Modal visible={true} transparent={true} onRequestClose={closeModal} className="w-full" animationType="fade">
          <ImageViewer
            imageUrls={images}
            renderIndicator={()=>null}
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

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsModalVisible(true)} // Open modal on image click
        className="w-full mt-3 relative flex justify-center items-center"
      >
        {/* <Image
          source={{ uri: thumbnail }}
          className="w-full rounded-xl mt-3"
          style={{ height: imageHeight }}  // Set a default height for the image
          resizeMode="cover"
        /> */}

        <Image
          source={{ uri: thumbnail }}
          className="w-full h-[100%] rounded-xl mt-3"
          style={{ height: 300 }}  // Set a default height for the image
          resizeMode="cover"
        />

        <TouchableOpacity
          onPress={() => setIsModalVisible(true)} // Open modal on zoom button click
          className="absolute right-4 bottom-4 bg-gray-400 p-2 rounded-full opacity-40"
        >
        
      <Image source={icons.zoom} className="w-6 h-6 opacity-100" resizeMode="contain"   tintColor={"black"}/>
 
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

export default VideoCard;
