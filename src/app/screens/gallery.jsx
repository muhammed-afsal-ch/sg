import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, View, TouchableOpacity, Image,ActivityIndicator,StyleSheet, Modal, Text, RefreshControl } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { getFilesFromBucket } from '@/lib/appwrite'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // Cache storage
import { router } from 'expo-router';
import ImageViewer from 'react-native-image-zoom-viewer'; // Import ImageViewer
import { icons } from '@/constants';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing'; 
import { FloatingAction } from 'react-native-floating-action';
import { useGlobalContext } from "../../context/Globalprovider";


const GalleryScreen = () => {
  const { user } = useGlobalContext();
  const [files, setFiles] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // To store selected image/video data
  const [isRefreshing, setIsRefreshing] = useState(false); // For pull-to-refresh
  const [isLoading, setIsLoading] = useState(false);


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
    const fileUrl = item.$download; // File URL
  
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
          <Video
            source={{ uri: fileUrl }}
            resizeMode={ResizeMode.COVER} // Or another mode for better preview
            shouldPlay={false} // Don't autoplay
            isMuted={true} // Mute the video preview
            style={styles.image} // Use the same style for uniformity
          />
        </TouchableOpacity>
      );
    }
  
    return null; // Return nothing if the item isn't an image or video
  };
  

  const closeModal = () => {
    setIsModalVisible(false); // Close the modal
    setSelectedFile(null); // Clear selected file data
  };

  // Prepare images array for ImageViewer (only image files)
  const images = selectedFile?.mimeType === 'image' ? [{ url: selectedFile.fileUrl }] : [];

  const handleShare = async () => {
    if (!selectedFile?.fileUrl) {
      Alert.alert('Error', 'No valid file to share.');
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Use a temporary cache directory for the downloaded file
      const fileExtension = selectedFile.mimeType.startsWith('video') ? 'mp4' : 'jpg'; // Set extension based on type
      const fileUri = FileSystem.cacheDirectory + `sargalayam_${new Date().getTime()}.${fileExtension}`;
  
      // Download the file
      const downloadResult = await FileSystem.downloadAsync(selectedFile.fileUrl, fileUri);
  
      // Ensure the file downloaded successfully
      if (downloadResult.status !== 200) {
        throw new Error('Failed to download the file.');
      }
  
      // Share the downloaded file
      await shareAsync(downloadResult.uri, {
        message: selectedFile.mimeType.startsWith('video')
          ? 'Check out this video!'
          : 'Check out this image!', // Optional caption based on type
      });
  
      setIsLoading(false);
    } catch (error) {
      console.error('Error in handleShare:', error);
  
      // Show a user-friendly alert
      Alert.alert('Error', 'Failed to share the file. Please try again.');
  
      // Ensure to stop the loader
      setIsLoading(false);
    }
  };
  
  

  return (
    <View style={styles.container} className='bg-black-100'>
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
        transparent={true} // Set transparent for image modal
        onRequestClose={closeModal}
        animationType="fade"
      >
        {selectedFile?.mimeType === 'image' ? (
          <>

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
          
          <ImageViewer
            imageUrls={images}
            saveToLocalByLongPress={false}
            enableSwipeDown={true}
            onSwipeDown={closeModal}
            renderFooter={() => null}
            renderHeader={() => (
              <>
              <TouchableOpacity onPress={handleShare}
               style={{
                position: 'absolute',
                top: 30,
                right: 50,
                backgroundColor: 'transparent',
                //borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 50,
                padding: 10,
                zIndex: 2,
              }}
              >
          <View className="p-3 rounded-full">
            <Image source={icons.share} style={{ width: 20, height: 20 }}  resizeMode="contain" />
          </View>
          </TouchableOpacity>

          <TouchableOpacity
                onPress={closeModal}
                style={{
                  position: 'absolute',
                  top: 40,
                  right: 20,
                  backgroundColor: 'transparent',
                  //borderWidth: 1,
                  borderColor: 'gray',
                  borderRadius: 50,
                  padding: 10,
                  zIndex: 2,
                }}
              >
                <Image source={icons.closex} style={{ width: 20, height: 20 }} resizeMode="contain" />
              </TouchableOpacity>
              </>
              
            )}
          />
</>
        ) : selectedFile?.mimeType === 'video' ? (
          <View style={styles.modalContainer}>
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
            <Video
              source={{ uri: selectedFile.fileUrl }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              shouldPlay
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              isLooping
              style={{
                width: "100%",
                height: "100%",
                backgroundColor:"black"
              }}
            />
            
  <TouchableOpacity
    onPress={handleShare}
    style={{
      position: 'absolute',
      top: 30,
      right: 55,
      backgroundColor: 'transparent',
      borderRadius: 50,
      padding: 10,
      zIndex: 2,
    }}
  >
    <View className="p-3 rounded-full">
      <Image source={icons.share} style={{ width: 20, height: 20 }} resizeMode="contain" />
    </View>
  </TouchableOpacity>


            <TouchableOpacity
              onPress={closeModal}
              style={styles.closeButton}
            >
              <Image source={icons.closex} style={styles.closeIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text>Unsupported File Type</Text>
        )}
      </Modal>
      {user && (
          <FloatingAction
            showBackground={false}
            color="#FF8E01"
            floatingIcon={<Text className="text-4xl text-white font-plight text-center mt-2">+</Text>}
            onPressMain={() => {
              router.push("admin/addtogallery");
            }}
            style={{
              position: 'absolute',
              bottom: 30,
              right: 20,
              zIndex: 999,
            }}
          />
        )}
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
    backgroundColor: 'black', // Ensures a black background for the modal
  },
  fullscreenImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black', // Fullscreen video background
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 50,
    padding: 10,
    zIndex: 2,
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
});

export default GalleryScreen;
