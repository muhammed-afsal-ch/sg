import { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert, Modal } from "react-native";
import ImageViewer from 'react-native-image-zoom-viewer';
import * as FileSystem from 'expo-file-system'; 

import { icons } from "../constants";

// Function to download the image using expo-file-system
const downloadImage = async (uri) => {
  try {
    const fileUri = FileSystem.documentDirectory + "downloaded_image.jpg"; // Define the file path
    const downloadedFile = await FileSystem.downloadAsync(uri, fileUri); // Download the file
    console.log('File downloaded to:', downloadedFile.uri);
    Alert.alert("Download Successful", "The image has been downloaded.");
  } catch (error) {
    console.error("Error downloading image:", error);
    Alert.alert("Download Failed", "There was an issue downloading the image.");
  }
};

const VideoCard = ({ item_code, item_name, category, thumbnail }) => {

  const images = [{
    url: thumbnail,
    props: {
      enableSwipeDown: true,
    }
  }];

  const [play, setPlay] = useState(false);
  const closeModal = () => {
    setPlay(false);
  };

  const handleDownloadPress = () => {
    downloadImage(thumbnail); // Download the image when the button is pressed
  };

  // State to hold the calculated width for square height
  const [containerWidth, setContainerWidth] = useState(0);

  // Handle the layout to get the width and calculate the height
  const handleLayout = (e) => {
    const { width } = e.nativeEvent.layout;
    setContainerWidth(width); // Set width for square height
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
              {category}
            </Text>
          </View>
        </View>

        <View className="pt-4 mr-4">
          <TouchableOpacity onPress={handleDownloadPress}>
            <Image source={icons.download} className="w-5 h-5" resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>

      {play ? (
        <Modal visible={true} transparent={true} onRequestClose={closeModal} className="w-full" animationType="fade">
          <ImageViewer
            imageUrls={images}
            renderHeader={(() => (
              <>
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
              </>
            ))}
            enableSwipeDown={true}
            onSwipeDown={closeModal}
          />
        </Modal>
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          onLayout={handleLayout}  // Capture the layout of the container
          className="w-full mt-3 relative flex justify-center items-center"
        >
          {/* Image with dynamic square height */}
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-[100%] rounded-xl mt-3"
            style={{ height: containerWidth }}  // Set height to the width of the container (square)
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => setPlay(true)}
            className=" absolute right-4 bottom-4"
          >
            <Image
              source={icons.zoom}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;
