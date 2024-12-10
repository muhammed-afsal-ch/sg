import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, ScrollView, Image, FlatList } from "react-native";
import { router } from "expo-router";
import { FloatingAction } from "react-native-floating-action";
import { VideoCard } from "@/components";
import useAppwrite from "@/lib/useAppwrite";
import { getAllResults, getItemByItemcode } from "@/lib/appwrite";
import Animation from '@/components/Animation';
import { useGlobalContext } from "../../context/Globalprovider";


const Result = () => {
  const { user } = useGlobalContext();

  const [isLoading, setIsLoading] = useState(true);
  const { data: latestAllResults } = useAppwrite(getAllResults);
  const [fullResults, setFullResults] = useState([]);

  useEffect(() => {
    setIsLoading(true)
    const fetchAdditionalData = async () => {
      if (!latestAllResults) return;

      const updatedResults = await Promise.all(
        latestAllResults.map(async (item) => {
          try {
            // Fetch additional item data using item_code
            const { itemlabel, category_code } = await getItemByItemcode(item.itemcode);
            return {
              ...item,
              itemlabel,
              category_code
            };
          } catch (error) {
            console.error(`Error fetching details for item_code ${item.itemcode}:`, error);
            return item; // If there’s an error, return the item with only available data
          }
        })
      );

      setFullResults(updatedResults);
      setIsLoading(false);
    };

    fetchAdditionalData();
  }, [latestAllResults]);

  //console.log(latestAllResults);

  if (isLoading) {
    return <Animation />;
  }

  const renderItem = ({ item }) => {
    return (
      <VideoCard
        item_code={item.itemcode}
        item_name={item.itemlabel}
        thumbnail={item.resultimage}
        category={item.category_code}
      />
    );
  };

  return (
    <>
      <SafeAreaView className="bg-primary h-full">



        <Text className="text-2xl text-white font-psemibold mb-4 px-4 my-6">Results</Text>

        <FlatList
          data={fullResults}  // Use the fetched data here
          keyExtractor={(item) => item.itemcode} // Adjust key extractor based on unique identifier
          renderItem={renderItem}  // Render each VideoCard component
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }} // Optional styling

        />

        {user && (
          <FloatingAction
            showBackground={false}
            color="#FF8E01"
            floatingIcon={<Text className="text-4xl text-white font-plight text-center mt-2 ">+</Text>}
            onPressMain={() => {
              router.push("admin/addresult");
            }}
            style={{
              position: 'absolute',
              bottom: 30,
              right: 20,
              zIndex: 999,
            }}
          />
        )}

      </SafeAreaView>
    </>
  );
};

export default Result;
