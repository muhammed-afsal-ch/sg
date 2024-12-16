import React, { useState } from "react";
import { Alert, FlatList, Image, ImageBackground, TouchableOpacity, ActivityIndicator, Text, View } from "react-native";
import { ResizeMode, Video } from "expo-av"; // Importing Video from expo-av
import * as Animatable from "react-native-animatable";
import * as FileSystem from "expo-file-system";
import { shareAsync } from 'expo-sharing';
import { icons } from "../constants";

const zoomIn = {
  0: { scale: 0.9 },
  1: { scale: 1 },
};

const zoomOut = {
  0: { scale: 1 },
  1: { scale: 0.9 },
};

const TrendingItem = ({ activeItem, item }) => {
  const [play, setPlay] = useState(false);
  const [videoStatus, setVideoStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlayToggle = () => {
    setPlay((prevState) => !prevState);
  };

  const handlePause = () => {
    setPlay(false); // Set play state to false when paused
  };

  const handleError = (error) => {
    console.error("Video error: ", error);
  };

  const handleShare = async () => {
    if (!item?.video) {
      Alert.alert("Error", "No valid file to share.");
      return;
    }

    setIsLoading(true);

    try {
      // Use a temporary cache directory for the downloaded file
      const fileExtension = "mp4"; // Assuming video files are always mp4
      const fileUri = FileSystem.cacheDirectory + `trending_${new Date().getTime()}.${fileExtension}`;

      // Download the video file
      const downloadResult = await FileSystem.downloadAsync(item.video, fileUri);

      if (downloadResult.status !== 200) {
        throw new Error("Failed to download the file.");
      }

      // Define your caption message
      const captionMessage = `Check out this video! 🌟\n\nRead more or visit our app: Sargalayam`;

      // Share the downloaded video with the caption
      await shareAsync(downloadResult.uri, {
        message: captionMessage, // Caption text
      });


      setIsLoading(false);
    } catch (error) {
      console.error("Error in handleShare:", error);

      // Show a user-friendly alert
      Alert.alert("Error", "Failed to share the file. Please try again.");
      setIsLoading(false);
    }
  };


  return (
    <Animatable.View
      className="mr-5"
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
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
      {play ? (
        <>
          <Video
            source={{ uri: item.video }}
            style={{
              width: 208,
              height: 288,
              borderRadius: 33,
              backgroundColor: "black",
            }}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay={play}
            onPlaybackStatusUpdate={(status) => {
              setVideoStatus(status);
              if (status.didJustFinish) {
                setPlay(false);
              }
              if (status.isPlaying === false) {
                handlePause();
              }
            }}
            onError={handleError}
          />
          <TouchableOpacity
            onPress={handleShare}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              backgroundColor: "transparent",
              borderColor: "gray",
              borderRadius: 50,
              padding: 10,
              zIndex: 2,
            }}
          >
            <View className="p-3 rounded-full">
              <Image source={icons.share} style={{ width: 20, height: 20 }} resizeMode="contain" />
            </View>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          className="relative flex justify-center items-center"
          activeOpacity={0.7}
          onPress={handlePlayToggle}
        >
          <ImageBackground
            source={{
              uri: item.thumbnail,
            }}
            className="w-52 h-72 rounded-[33px] my-5 overflow-hidden shadow-lg shadow-black/40"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};

const Trending = ({ posts }) => {
  const [activeItem, setActiveItem] = useState(posts[1]);

  const viewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].key);
    }
  };

  return (
    <>
      <FlatList
        data={posts}
        horizontal
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TrendingItem activeItem={activeItem} item={item} />
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 70,
        }}
        contentOffset={{ x: 170 }}
      />
    </>
  );
};

export default Trending;
