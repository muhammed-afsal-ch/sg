import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Alert, Image } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library"; // Import MediaLibrary
import { icons } from "@/constants";

const NotificationCard = ({ title, time, description, downloadLink }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);  // Track download progress

  const handleDownload = async () => {
    if (!downloadLink) {
      Alert.alert("Error", "No download link provided.");
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      // Request permission to access the media library on Android
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "We need permission to download files.");
        setIsDownloading(false);
        return;
      }

      // Define the file path to save the file
      const fileUri = `${FileSystem.documentDirectory}${downloadLink.split("/").pop()}`;

      // Create a download resumer
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadLink,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);  // Update download progress
        }
      );

      // Start downloading the file
      const { uri } = await downloadResumable.downloadAsync();
      Alert.alert("Download Complete", `File downloaded to: ${uri}`);

      // Optionally, open the file after downloading (example: opening a PDF or image)
      //await Linking.openURL(uri);
      setIsDownloading(false);
    } catch (error) {
      console.error("Download failed:", error);
      Alert.alert("Error", "File download failed. Please try again.");
      setIsDownloading(false);
    }
  };

  return (
    <View>
      {/* Notification Card */}
      <TouchableOpacity style={styles.notificationCard} onPress={() => setModalVisible(true)}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>📄</Text>
        </View>
        <View style={styles.notificationText}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.notificationTime}>{time}</Text>
        </View>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setModalVisible(false)} // Close modal on clicking outside
        >
          <Pressable style={styles.modalContent} onPress={() => { }}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Image
                  source={icons.cancel}
                  className="w-[30px] h-[30px] -mt-10 -mr-5"
                  resizeMode="contain"
                />
              </Pressable>
            </View>
            <Text style={styles.modalTime}>{time}</Text>
            <Text style={styles.modalDescription}>{description}</Text>

            {/* Download Button */}
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownload}
              disabled={isDownloading}
            >
              <Text style={styles.downloadButtonText}>
                {isDownloading ? "Downloading..." : "Download"}
              </Text>
            </TouchableOpacity>

            {/* Download Progress */}
            {isDownloading && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Downloading: {Math.round(downloadProgress * 100)}%
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#f5f9ff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#e6f1ff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
    color: "#3178f4",
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#161622",
  },
  notificationTime: {
    fontSize: 14,
    color: "#8c9ab8",
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#161622",
  },
  modalTime: {
    fontSize: 14,
    color: "#8c9ab8",
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: "#161622",
  },
  downloadButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#3178f4",
    borderRadius: 8,
    alignItems: "center",
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 20,
  },
  progressText: {
    fontSize: 14,
    color: "#3178f4",
  },
});

export default NotificationCard;
