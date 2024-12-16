import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert, Modal, ActivityIndicator } from "react-native";
import ImageViewer from 'react-native-image-zoom-viewer';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing'; // Import shareAsync for sharing functionality
import { Platform } from 'react-native';
import { useGlobalContext } from "@/context/Globalprovider";
import { icons } from "../constants";
import sargalayamlogo from "../assets/images/sargalayam-logo.png";

const PostCard = ({ caption, thumbnail }) => {
  const { user } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 }); // State for image dimensions
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);


  // useEffect(() => {
  //   // Fetch the image dimensions
  //   Image.getSize(
  //     thumbnail[0],
  //     (width, height) => {
  //       setImageDimensions({ width, height });
  //     },
  //     (error) => {
  //       console.error("Failed to get image dimensions:", error);
  //     }
  //   );
  // }, [thumbnail]);

  useEffect(() => {
    if (thumbnail && thumbnail.length > 0 && thumbnail[0]) {
      Image.getSize(
        thumbnail[0], // Get dimensions of the first thumbnail
        (width, height) => {
          setImageDimensions({ width, height });
        },
        (error) => {
          console.error("Failed to get image dimensions:", error);
        }
      );
    } else {
      console.warn("Thumbnail is undefined or empty.");
    }
  }, [thumbnail]);


  const handleShare = async () => {
    setIsLoading(true);

    try {
      // Step 1: Download the image to local file system
      const fileUri = FileSystem.documentDirectory + `sargalayam_${new Date().getTime()}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(thumbnail[currentImageIndex], fileUri); // Use currentImageIndex
      setIsLoading(false);
      // Step 2: Share image with a caption
      await shareAsync(downloadResult.uri, {
        message: `Check out this item: ${caption} @Sargalayam App`, // Update this with appropriate caption
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
          Alert.alert("Success", "Image saved successfully!");
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
    const filename = `sargalayam_${new Date().getTime()}.jpg`;
    const activeImage = thumbnail[currentImageIndex]; // Get the active image URL based on the index

    try {
      const result = await FileSystem.downloadAsync(
        activeImage, // Use active image from the thumbnail array
        FileSystem.documentDirectory + filename
      );

      const mimetype = result.headers["Content-Type"] || "application/octet-stream";
      saveFile(result.uri, filename, mimetype);
      setIsLoading(false);
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert("Download Failed", "There was an issue downloading the file.");
      setIsLoading(false);
    }
  }


  const images = thumbnail.map((imageUrl) => ({
    url: imageUrl,
    props: {
      enableSwipeDown: true,
    },
  }));


  const handleImageClick = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const aspectRatio = imageDimensions.width / imageDimensions.height || 1;

  return (
    <View className="flex flex-col items-center px-4 mb-14">
      <View className="flex flex-row gap-3 items-start justify-center ">
        <View className="flex justify-center items-center flex-row flex-1">


          <Image
            source={sargalayamlogo}
            className="w-10 h-10 rounded-full"
            resizeMode="contain"
          />
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

        <View className="mr-4 flex flex-row gap-2">
          <TouchableOpacity onPress={download}>
            <View className="p-3 rounded-full ">
              <Image source={icons.download} className="w-5 h-5" resizeMode="contain" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare}>
            <View className="p-3 rounded-full">
              <Image source={icons.share} className="w-5 h-5" resizeMode="contain" />
            </View>
          </TouchableOpacity>


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


      <View
        style={{
          width: "100%", // Full width of the container
          aspectRatio: aspectRatio,
          borderRadius: 12,
          overflow: "hidden", // Ensure the ImageViewer respects the container's bounds
          position: "relative", // Allow absolute positioning of arrows
        }}
        className="mt-3"
      >
        <ImageViewer
          imageUrls={images}
          style={{ flex: 1 }} // Let it fill the container
          enableImageZoom={false}
          onChange={(index) => setCurrentImageIndex(index)} // Update current image index
          saveToLocalByLongPress={false}
          index={currentImageIndex} // Make sure the index is passed to ImageViewer
          enablePreload={true}
          pageAnimateTime={() => 100 / 2}
        />

        {/* Left Arrow */}
        {images.length > 1 && currentImageIndex > 0 && (
          <TouchableOpacity
            onPress={() => {
              // Decrease index to show the previous image
              setCurrentImageIndex((prev) => Math.max(prev - 1, 0));
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-400 p-2 rounded-full opacity-60"
          >
            <Image
              source={icons.leftArrow}
              className="w-6 h-6 opacity-100"
              resizeMode="contain"
              tintColor={"black"}
            />
          </TouchableOpacity>
        )}

        {/* Right Arrow */}
        {images.length > 1 && currentImageIndex < images.length - 1 && (
          <TouchableOpacity
            onPress={() => {
              // Increase index to show the next image
              setCurrentImageIndex((prev) => Math.min(prev + 1, images.length - 1));
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-400 p-2 rounded-full opacity-60"
          >
            <Image
              source={icons.rightArrow}
              className="w-6 h-6 opacity-100"
              resizeMode="contain"
              tintColor={"black"}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="absolute right-4 bottom-4 bg-gray-400 p-2 rounded-full opacity-40"
          onPress={handleImageClick}
        >
          <Image
            source={icons.zoom}
            className="w-6 h-6 opacity-100"
            resizeMode="contain"
            tintColor={"black"}
          />
        </TouchableOpacity>
      </View>

      <View className="flex flex-start w-full mt-3">
        <Text
          className={`text-base text-white font-alight ${!expanded ? 'line-clamp-2' : ''
            }`}
          style={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: !expanded ? 2 : 'none',
            WebkitBoxOrient: 'vertical',
          }}
        >
          {caption}
        </Text>
        {caption.length > 100 && ( // Adjust this condition based on the length you want
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text className="text-blue-500 mt-1">
              {expanded ? 'Read Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
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
          menuContext={() => null}
          menus={() => null}
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
