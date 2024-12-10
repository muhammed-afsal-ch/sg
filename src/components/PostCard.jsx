import { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert, Modal, ActivityIndicator } from "react-native";
import ImageViewer from 'react-native-image-zoom-viewer';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing'; // Import shareAsync for sharing functionality
import { Platform } from 'react-native';
import { useGlobalContext } from "@/context/Globalprovider";
import { icons } from "../constants";
import { router } from "expo-router";

const PostCard = ({ caption, thumbnail }) => {
  const { user } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state

  const handleShare = async () => {
    setIsLoading(true);

    try {
      // Step 1: Download the image to local file system
      const fileUri = FileSystem.documentDirectory + `${item_code}-${item_name}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(thumbnail, fileUri);

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
    const filename = `${item_code}-${item_name}.jpg`;
    try {
      const result = await FileSystem.downloadAsync(
        thumbnail,
        FileSystem.documentDirectory + filename
      );

      const mimetype = result.headers["Content-Type"] || "application/octet-stream";
      saveFile(result.uri, filename, mimetype); // Pass the correct MIME type
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert("Download Failed", "There was an issue downloading the file.");
    }
  }

  const images = [{
    url: thumbnail,
    props: {
      enableSwipeDown: true,
    }
  },
  {
    url: thumbnail,

  }];

  const handleImageClick = () => {
    setIsModalVisible(true); // Show the modal when the image is clicked
  };

  const closeModal = () => {
    setIsModalVisible(false); // Hide the modal
  };

  return (
    <View className="flex flex-col items-center px-4 mb-14">
      <View className="flex flex-row gap-3 items-start justify-center ">
        <View className="flex justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
            <View className="bg-white w-[39px] h-[39px] rounded-lg flex justify-center items-center">
              <Text className="font-pesemibold text-xl ">SK</Text>
            </View>
          </View>

          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="font-psemibold text-sm text-white"
              numberOfLines={1}
            >
              SKSSF SARGALAYAM
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              2024
            </Text>
          </View>
        </View>

        <View className="pt-4 mr-4 flex flex-row gap-2">
          <TouchableOpacity onPress={download}>
            <Image source={icons.download} className="w-5 h-5" resizeMode="contain" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} className={`ml-4 ${user ? "mr-5" : ""}`}>
            <Image source={icons.share} className="w-5 h-5" resizeMode="contain" />
          </TouchableOpacity>

          {user && (
            <TouchableOpacity
              onPress={() => {
                router.push(`/admin/${item_code}`)
              }}
            >
              <Image source={icons.edit} className="w-5 h-5" resizeMode="contain" />
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

      {/* <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleImageClick} // Open modal on image click
        className="w-full mt-3 relative flex justify-center items-center"
      >
        <Image
          source={{ uri: thumbnail }}
          className="w-full h-[100%] rounded-xl mt-3"
          style={{ height: 300 }} // Set a default height for the image
          resizeMode="cover"
        /> */}
          <View
        style={{
          width: "100%",
          height: 365, // Set a default height for the container
          borderRadius: 12,
          overflow: "hidden", // Ensure the ImageViewer respects the container's bounds
          
        }}
        className="mt-3"
      >
        <ImageViewer
          imageUrls={images}
         // enableSwipeDown={false} // Disable swipe-down since it's not a modal
         // renderIndicator={() => null} // Hide the image index indicator
          //renderFooter={() => null} // Remove any footer menu
          //renderHeader={() => null} // No header for embedded viewer
          //menuContext={()=> null}
          //menus={()=> null}
         // backgroundColor="transparent" // Ensure it blends well with your design
          style={{ flex: 1 }} // Let it fill the container
          saveToLocalByLongPress={false}
        />
  
    <TouchableOpacity className="absolute right-4 bottom-4 bg-gray-400 p-2 rounded-full opacity-40" onPress={handleImageClick}>
      <Image source={icons.zoom} className="w-6 h-6 opacity-100" resizeMode="contain"   tintColor={"black"}/>
    </TouchableOpacity>
      </View>
        {/* <TouchableOpacity className="absolute right-4 bottom-4">
          <Image source={icons.zoom} className="w-6 h-6" resizeMode="contain" />
        </TouchableOpacity>
     </TouchableOpacity> */}

      <View className="flex flex-start w-full mt-3">
        <Text className="text-xl text-white font-amedium ">{caption}</Text>
      </View>

      {/* Modal for ImageViewer */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={closeModal}
        animationType="fade"
      >
        <ImageViewer
          imageUrls={images}
          enableSwipeDown={true}
          onSwipeDown={closeModal}
          //renderIndicator={() => null} 
          renderFooter={() => null} 
          menuContext={()=> null}
          menus={()=> null}
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
              <Image source={icons.closex} className="w-8 h-8 rounded-full" resizeMode="contain" />
            </TouchableOpacity>
          )}
        />
      </Modal>
    </View>
  );
};

export default PostCard;
