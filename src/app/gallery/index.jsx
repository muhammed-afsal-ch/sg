import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, View, TouchableOpacity, Image, StyleSheet, Modal, Text, Button, RefreshControl } from 'react-native';
import { Video } from 'expo-av';
import { getFilesFromBucket } from '@/lib/appwrite'; // Assuming your appwrite function is imported
import AsyncStorage from '@react-native-async-storage/async-storage'; // Cache storage

const GalleryScreen = () => {
  const [files, setFiles] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // To store selected image/video data
  const [isRefreshing, setIsRefreshing] = useState(false); // For pull-to-refresh

  // Function to fetch files from the Appwrite bucket
  const fetchData = async () => {
    const files = await getFilesFromBucket(); // Fetch files from your Appwrite bucket
    setFiles(files);
    await AsyncStorage.setItem('files', JSON.stringify(files)); // Cache the files in AsyncStorage
  };

  // Fetch cached files on first render
  const fetchCachedData = async () => {
    try {
      const cachedFiles = await AsyncStorage.getItem('files');
      if (cachedFiles) {
        setFiles(JSON.parse(cachedFiles)); // Use cached files if available
      } else {
        fetchData(); // If no cached data, fetch from server
      }
    } catch (error) {
      console.error('Error loading cached files:', error);
    }
  };

  // useEffect to fetch cached data on mount
  useEffect(() => {
    fetchCachedData();
  }, []);

  // Handle image/video click
  const handleImagePress = (fileUrl, mimeType) => {
    setSelectedFile({ fileUrl, mimeType });
    setIsModalVisible(true); // Show the modal when an image/video is clicked
  };

  // Function to refresh the files list (called during pull-to-refresh)
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData().finally(() => {
      setIsRefreshing(false); // Stop refreshing after data is fetched
    });
  }, []);

  // Render item for FlatList
  const renderItem = ({ item }) => {
    const fileUrl = item.$download; // This now holds the file URL

    // Check if the mimeType is an image or video and render accordingly
    if (item.mimeType.startsWith('image')) {
      return (
        <TouchableOpacity onPress={() => handleImagePress(fileUrl, 'image')}>
          <Image source={{ uri: fileUrl }} style={styles.image} />
        </TouchableOpacity>
      );
    } else if (item.mimeType.startsWith('video')) {
      return (
        <TouchableOpacity onPress={() => handleImagePress(fileUrl, 'video')}>
          <Image source={{ uri: fileUrl }} style={styles.image} />
        </TouchableOpacity>
      );
    }

    return null; // Return nothing if the item isn't an image or video
  };

  const closeModal = () => {
    setIsModalVisible(false); // Close the modal
    setSelectedFile(null); // Clear selected file data
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={files}
        numColumns={3} // Set the number of columns for grid layout
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing} // Control the refreshing state
            onRefresh={onRefresh} // Trigger fetchData when pull-to-refresh is activated
          />
        }
      />

      {/* Modal to show the full-screen image/video */}
      <Modal
        visible={isModalVisible}
        onRequestClose={closeModal}
        animationType="fade"
        transparent={false} // Make the modal non-transparent
      >
        <View style={styles.modalContainer}>
          {selectedFile?.mimeType === 'image' ? (
            <Image source={{ uri: selectedFile.fileUrl }} style={styles.fullscreenImage} />
          ) : selectedFile?.mimeType === 'video' ? (
            <Video
              source={{ uri: selectedFile.fileUrl }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="contain"
              shouldPlay
              isLooping
              style={styles.fullscreenVideo}
            />
          ) : (
            <Text>Unsupported File Type</Text>
          )}
          <Button title="Close" onPress={closeModal} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  grid: {
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  fullscreenImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  fullscreenVideo: {
    width: '100%',
    height: '80%',
    backgroundColor: 'black',
  },
});

export default GalleryScreen;
