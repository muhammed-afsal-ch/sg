import NotificationCard from "@/components/NotificationCard";
import { useEffect } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackHandler } from "react-native";
import { router } from "expo-router";
import useAppwrite from "@/lib/useAppwrite";
import { getAllDownloadFiles } from "@/lib/appwrite";

// Utility function to format the date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    // hour: "2-digit",
    // minute: "2-digit",
    // hour12: true,
  }).format(date);
};

const Manual = () => {
  const { data: notifications } = useAppwrite(getAllDownloadFiles);

  useEffect(() => {
    const backAction = () => {
      router.back(); // Redirect to home screen or previous page
      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup the listener
  }, []);

  return (
    <SafeAreaView className="px-4  h-full">
      {notifications.map((item, index) => (
        <NotificationCard
          key={index}
          title={item.title}
          time={formatDate(item.$updatedAt)} // Format the date here
          description={item.description}
          downloadLink={item.downloadLink}
        />
      ))}
    </SafeAreaView>
  );
};

export default Manual;
