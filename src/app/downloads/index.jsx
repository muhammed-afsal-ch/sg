import NotificationCard from "@/components/NotificationCard";
import { useEffect } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackHandler } from "react-native";
import { router } from "expo-router";
import useAppwrite from "@/lib/useAppwrite";
import { getAllDownloadFiles } from "@/lib/appwrite";


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

  // const notifications = [
  //   {
  //     title: "Elimination Round Schedule of Section A",
  //     time: "Today 12:00 PM",
  //     description:
  //       "The elimination round schedule for Section A & B of SIBAQ 25 is now available on the SIBAQ website. Please visit the Downloads Page to view the schedule.",
  //     downloadLink: "https://example.com/schedule.pdf",
  //   },
  //   {
  //     title: "Hall ticket for contestants",
  //     time: "Today 04:30 PM",
  //     description: "Contestants can now download their hall tickets.",
  //     downloadLink: "https://example.com/hallticket.pdf",
  //   },
  //   {
  //     title: "SIBAQ 25 Elimination Round Schedule",
  //     time: "Today 04:30 PM",
  //     description: "The elimination round schedule has been updated.",
  //     downloadLink: "https://example.com/updated-schedule.pdf",
  //   },
  // ];

  return (
    <SafeAreaView className="px-4  h-full">

      <Text>  hallo</Text>
      {notifications.map((item, index) => (
        <NotificationCard
          key={index}
          title={item.title}
          time={item.time}
          description={item.description}
          downloadLink={item.downloadLink}
        />
      ))}

    </SafeAreaView>
  );
};

export default Manual;

