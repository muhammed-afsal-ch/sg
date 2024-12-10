import React, { useState } from "react";
import { View, Button, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";

const FilePickerWithPermissions = () => {
  const [values, setValues] = useState({ resultimage: null, video: null });

  // Function to request permissions
  const requestPermissions = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "The app needs access to your media library to pick files."
      );
      return false;
    }
    return true;
  };

  // Function to open the document picker
  const openPicker = async (selectType) => {
    // Request permissions before opening picker
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: selectType === "image" ? ["image/*"] : ["video/*"], // Accept images or videos
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        // Set the result based on the type of file
        if (selectType === "image") {
          setValues((prevValues) => ({
            ...prevValues,
            resultimage: {
              uri: result.uri,
              name: result.name,
              type: result.mimeType || "image/png", // Fallback type for images
            },
          }));
        } else if (selectType === "video") {
          setValues((prevValues) => ({
            ...prevValues,
            video: {
              uri: result.uri,
              name: result.name,
              type: result.mimeType || "video/mp4", // Fallback type for videos
            },
          }));
        }
        Alert.alert("File Selected", `File: ${result.name}`);
      } else {
        console.log("Document picker canceled");
      }
    } catch (error) {
      console.error("Error during file picking:", error);
      Alert.alert("Error", "Failed to pick the file. Please try again.");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Choose Image" onPress={() => openPicker("image")} />
      <Button title="Choose Video" onPress={() => openPicker("video")} />
    </View>
  );
};

export default FilePickerWithPermissions;
