import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Alert, Image, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library"; // Import MediaLibrary
import { icons } from "@/constants"; // Assuming icons are imported here.
import { shareAsync } from 'expo-sharing';

const NotificationCard = ({ title, time, description, downloadLink }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0); // Track download progress

  // Download function
  const handleDownload = async () => {
    if (!downloadLink) {
      Alert.alert("Error", "No download link provided.");
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      // Define filename based on downloadLink (extract the file name from the URL)
      const filename = `${downloadLink.split("/").pop()}`;
      
      // If the file is a PDF, explicitly set the filename extension to '.pdf'
      const fileExtension = filename.toLowerCase().endsWith(".pdf") ? ".pdf" : ".pdf"; // Ensure .pdf extension

      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      // Download the file
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadLink,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress); 
        }
      );

      // Start download
      const { uri } = await downloadResumable.downloadAsync();

      // Call save function once the download is complete
      save(uri, filename, "application/pdf"); // Explicitly set mimeType to 'application/pdf'

      setIsDownloading(false);
    } catch (error) {
      console.error("Download failed:", error);
      Alert.alert("Error", "File download failed. Please try again.");
      setIsDownloading(false);
    }
  };

  // Save file to external storage or share it
  const save = async (uri, filename, mimetype) => {
    if (Platform.OS === "android") {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        try {
          const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            filename,
            mimetype
          );
          await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
        } catch (e) {
          console.log("Error saving file on Android", e);
          shareAsync(uri); // Fallback if saving fails
        }
      } else {
        // If permission is denied, share the file
        shareAsync(uri);
      }
    } else {
      // On iOS or others, just share the file
      shareAsync(uri);
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
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)}>
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
