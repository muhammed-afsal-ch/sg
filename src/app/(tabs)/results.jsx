import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, StyleSheet, Image, RefreshControl, TextInput } from "react-native";
import { router } from "expo-router";
import { FloatingAction } from "react-native-floating-action";
import { EmptyState, VideoCard } from "@/components";
import { Dropdown } from 'react-native-element-dropdown';
import useAppwrite from "@/lib/useAppwrite";
import { getAllResults, getItemByItemcode } from "@/lib/appwrite";
import Animation from '@/components/Animation';
import { useGlobalContext } from "../../context/Globalprovider";
import { icons } from "@/constants";
import { useLocalSearchParams } from "expo-router";

const Result = () => {
  const { user } = useGlobalContext();
  const { homequery } = useLocalSearchParams(); // Extract the search query from the URL
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: latestAllResults } = useAppwrite(getAllResults);
  const [fullResults, setFullResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState(homequery || ""); // Initialize with query if available

  const generalSubcategories = [
    { code: 'G.K', label: 'General Kiddies' },
    { code: 'G.SJ', label: 'General Sub Junior' },
    { code: 'G.J', label: 'General Junior' },
    { code: 'G.S', label: 'General Senior' },
    { code: 'G.SS', label: 'General Super Senior' },
    { code: 'G.G', label: 'General Group' }
  ];

  const twalabaSubcategories = [
    { code: 'T.J', label: 'Twalaba Junior' },
    { code: 'T.S', label: 'Twalaba Senior' },
    { code: 'T.G', label: 'Twalaba Group' }
  ];

  const allCategories = [
    { label: "All", value: null },
    ...generalSubcategories.map((cat) => ({ label: cat.label, value: cat.code })),
    ...twalabaSubcategories.map((cat) => ({ label: cat.label, value: cat.code })),
  ];

  const fetchAdditionalData = async () => {
    if (!latestAllResults) return;

    const updatedResults = await Promise.all(
      latestAllResults.map(async (item) => {
        try {
          const { itemlabel, category_code, itemname } = await getItemByItemcode(item.itemcode);
          return {
            ...item,
            itemlabel,
            category_code,
            itemname
          };
        } catch (error) {
          console.error(`Error fetching details for item_code ${item.itemcode}:`, error);
          return item;
        }
      })
    );

    setFullResults(updatedResults);
    setFilteredResults(updatedResults.slice(0, 10)); // Limit to 10 items
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    setIsLoading(true);
    setSelectedCategory(null);
    fetchAdditionalData();
  }, [latestAllResults]);

  const handleFilter = (category) => {
    setSelectedCategory(category);
    if (category) {
      const filtered = fullResults.filter((item) => item.category_code === category);
      setFilteredResults(filtered.slice(0, 10)); // Limit to 10 items
    } else {
      setFilteredResults(fullResults.slice(0, 10)); // Show first 10 results if no category is selected
    }
  };
  const detectLanguage = (query) => {
    const malayalamRegex = /[\u0D00-\u0D7F]/;
    if (malayalamRegex.test(query)) {
      return "ml"; // Malayalam
    }
    return "en"; // Default to English
  };
  
  const handleSearch = (query) => {
    setSearchQuery(query);
  
    if (!query?.trim()) {
      handleFilter(selectedCategory);
      return;
    }
  
    if (query.trim() === "") {
      handleFilter(selectedCategory); // Reset to category filter
    } else {
      const detectedLanguage = detectLanguage(query);
  
      // Filter logic based on language detection
      const filtered = fullResults.filter((item) => {
        if (!isNaN(query)) {
          return item.itemcode.toString().includes(query);
        } else if (detectedLanguage === "en") {
          // Case-insensitive search for English
          return item.itemname && item.itemname.toLowerCase().includes(query.toLowerCase());
        } else if (detectedLanguage === "ml") {
          // Case-insensitive search for Malayalam
          return item.itemlabel && item.itemlabel.toLowerCase().includes(query.toLowerCase());
        }
        return false;
      });
  
      setFilteredResults(filtered.slice(0, 10)); // Limit to 10 items
    }
  };
  

  useEffect(() => {
    setIsLoading(true);
    fetchAdditionalData().then(() => {
      if (homequery) {
        setSearchQuery(homequery);
        handleSearch(homequery);
      }
    });
  }, [latestAllResults]);

  useEffect(() => {
    setSearchQuery(homequery || ""); // Set default or extracted query
    handleSearch(homequery);
  }, [homequery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSelectedCategory(null);
    setSearchQuery("");
    try {
      const refreshedResults = await getAllResults();
      const updatedResults = await Promise.all(
        refreshedResults.map(async (item) => {
          try {
            const { itemlabel, category_code } = await getItemByItemcode(item.itemcode);
            return { ...item, itemlabel, category_code };
          } catch (error) {
            console.error(`Error fetching details for item_code ${item.itemcode}:`, error);
            return item;
          }
        })
      );

      setFullResults(updatedResults);
      setFilteredResults(updatedResults.slice(0, 10)); // Apply default filter and limit
    } catch (error) {
      console.error("Error refreshing results:", error);
    } finally {
      setIsRefreshing(false); // Stop the loading indicator
    }
  };

  if (isLoading) {
    return <Animation />;
  }

  const renderItem = ({ item }) => (
    <VideoCard
      item_code={item.itemcode}
      item_name={item.itemlabel}
      thumbnail={item.resultimage}
      category={item.category_code}
    />
  );

  return (
    <SafeAreaView className="bg-primary h-full">
      <Text className="text-2xl text-white font-psemibold mb-4 px-4 my-6">Results</Text>

      <FlatList
        ListHeaderComponent={
          <View className="px-4 mb-4">
            <Text className="text-base text-gray-100 font-pmedium mb-2">Search any results</Text>

            <View className="flex flex-row items-center space-x-4 w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary">
              <TextInput
                className="text-base mt-0.5 text-white flex-1 font-pregular"
                value={searchQuery}
                placeholder="Search by item name or code"
                placeholderTextColor="#CDCDE0"
                onChangeText={handleSearch}
              />

              <Image source={icons.search} className="w-5 h-5" resizeMode="contain" />
            </View>

            <Text className="text-base text-gray-100 font-pmedium mb-2 mt-4">Select Category</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={allCategories}
              labelField="label"
              valueField="value"
              placeholder="Select a category"
              value={selectedCategory}
              onChange={(item) => handleFilter(item.value)}
            />
          </View>
        }
        data={filteredResults}
        keyExtractor={(item) => item.itemcode}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }}
        ListEmptyComponent={() => (
          <View className="mb-16">
            <EmptyState title="No Results Found" subtitle="No Results uploaded yet" />
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#FF8E01"]}
            tintColor="#FF8E01"
          />
        }
      />

      {user && (
        <FloatingAction
          showBackground={false}
          color="#FF8E01"
          floatingIcon={<Text className="text-4xl text-white font-plight text-center mt-2">+</Text>}
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
  );
};
const styles = StyleSheet.create({
  searchInput: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 16,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  placeholderStyle: {
    fontSize: 16,
    color: 'gray',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#000',
  },
});

export default Result;
