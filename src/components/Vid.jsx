import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { Video } from 'expo-av';

const VideoList = ({ videos }) => {
  return (
    <FlatList
      data={videos}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => <Vid videoUrl={item.uri} />}
    />
  );
};

const Vid = ({ videoUrl }) => {
  return (
    <View style={styles.container}>
      <Video
        source={{ uri: videoUrl }}
        useNativeControls={true}
        resizeMode="contain"
        shouldPlay={false}  // Set to true if you want to auto-play
        style={styles.video}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,  // Add margin to separate each video
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: 300,
  },
});

const App = () => {
  const videoData = [
    { uri: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { uri: 'https://www.w3schools.com/html/movie.mp4' },
    { uri: 'https://www.w3schools.com/html/movie.mp4' },  // Add more URLs as needed
  ];

  return (
    <View style={{ flex: 1 }}>
      <VideoList videos={videoData} />
    </View>
  );
};

export default App;
