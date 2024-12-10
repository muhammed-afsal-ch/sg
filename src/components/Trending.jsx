import { useState } from "react";
import { ResizeMode, Video } from "expo-av"; // Importing Video from expo-av
import * as Animatable from "react-native-animatable";
import {
  FlatList,
  Image,
  ImageBackground,
  TouchableOpacity,
  Text
} from "react-native";

import { icons } from "../constants";
import Vid from "./Vid";

// Zoom animations for the trending items
const zoomIn = {
  0: {
    scale: 0.9,
  },
  1: {
    scale: 1,
  },
};

const zoomOut = {
  0: {
    scale: 1,
  },
  1: {
    scale: 0.9,
  },
};

// Component for each individual trending item
const TrendingItem = ({ activeItem, item }) => {
  const [play, setPlay] = useState(false);
  const [videoStatus, setVideoStatus] = useState(null);

  const handlePlayToggle = () => {
    setPlay((prevState) => !prevState);
  };

  const handlePause = () => {
    setPlay(false);  // Set play state to false when paused
  };

  const handleError = (error) => {
    console.error("Video error: ", error);
  };

  return (
    <Animatable.View
      className="mr-5"
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      {play ? (
        <>
          {/* <Video
            source={{ uri: item.video }} // Ensure this URI is correct
            style={{
              width: 208,
              height: 288,
              borderRadius: 33,
              backgroundColor: "black", // Ensure video background is black while loading
            }}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay={play}
            onPlaybackStatusUpdate={(status) => {
              setVideoStatus(status);
              if (status.didJustFinish) {
                setPlay(false); // Automatically stop when finished
              }
              if (status.isPlaying === false) {
                handlePause(); // Handle pausing and show thumbnail
              }
            }}
            onError={handleError} // Handle errors if video doesn't load
          /> */}

          <Video
            //className="w-52 h-72 rounded-[33px] mt-3 bg-white/10"
            source={{ uri: item.video }}
           style={{
              width: 208,
              height: 288,
              borderRadius: 33,
              backgroundColor: "black", // Ensure video background is black while loading
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
                handlePause(); // Handle pausing and show thumbnail
              }
              onError={handleError}
            }}
          />
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

  const videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';  // Example video URL


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
      <Vid videoUrl={videoUrl} />

    </>
  );
};

export default Trending;
