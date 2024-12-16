import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, RefreshControl, Text, TouchableOpacity, Image, View, Linking, BackHandler } from "react-native";
import { icons, images } from "../../constants";
import { getAllPosts, getLatestThreePosts, getItemByItemcode, getLatestPosts } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/Globalprovider";
import PostCard from "@/components/PostCard";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FloatingAction } from "react-native-floating-action";
import { EmptyState, SearchInput, Trending } from "../../components";
import Bubble from "@/components/Bubble";
import useAppwrite from "@/lib/useAppwrite";

const Home = () => {
  const { user } = useGlobalContext();
  const { data: latestAllResults } = useAppwrite(getLatestThreePosts);
  const [posts, setPosts] = useState([]);  // Track posts
  const [hilights, setHilights] = useState([]);  // For highlights
  const [page, setPage] = useState(1);  // Page for pagination
  const [loading, setLoading] = useState(false);  // To track if posts are being fetched
  const [refreshing, setRefreshing] = useState(false);  // For pull-to-refresh
  const [fullResults, setFullResults] = useState([]);
  const [isClicked, setIsClicked] = useState(false);


  useEffect(() => {
    const checkIfClicked = async () => {
      const clicked = await AsyncStorage.getItem('buttonClicked');
      if (clicked === "true") {
        setIsClicked(true);
      }
    };

    checkIfClicked();

    // Handle back button press
    const backAction = () => {
      BackHandler.exitApp();  // Exit the app directly without confirmation
      return true; // Prevent the default behavior (which is to navigate back)
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    // Cleanup on unmount
    return () => backHandler.remove();
  }, []);

  const getHilights = async () => {
    getLatestPosts().then((data) => {
      setHilights(data);
    });
  };

  const fetchPosts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const data = await getAllPosts(pageNum, 10); // Fetch 10 posts for the given page
      if (pageNum === 1) {
        setPosts(data); // Set initial data when page is 1
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data]); // Append new posts when loading more
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(1);  // Fetch the first batch of posts again
    await getHilights();  // Fetch highlights again
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (!loading) {
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchPosts(nextPage);  // Fetch next page of posts
        return nextPage;
      });
    }
  };

  useEffect(() => {
    fetchPosts(1);  // Initial fetch on component mount
    getHilights();  // Get highlights data
  }, []);

  useEffect(() => {
    const fetchAdditionalData = async () => {
      if (!latestAllResults) return;

      const updatedResults = await Promise.all(
        latestAllResults.map(async (item) => {
          try {
            const { itemlabel, category_code } = await getItemByItemcode(item.itemcode);
            return {
              ...item,
              itemlabel,
              category_code,
            };
          } catch (error) {
            console.error(`Error fetching details for item_code ${item.itemcode}:`, error);
            return item;
          }
        })
      );

      setFullResults(updatedResults);
    };

    fetchAdditionalData();
  }, [latestAllResults]);

  const [isDoubleClicked, setIsDoubleClicked] = useState(false);
  const timerRef = useRef(null);

  const handleSingleClick = () => {
    router.push("/sign-in")
  };

  const handleDoubleClick = () => {
    Linking.openURL("https://sargalayam.in")
  };

  const handleLongPress = () => {
    if (!isDoubleClicked) {
      timerRef.current = setTimeout(() => {
        handleSingleClick();
      }, 3000);
    }
  };

  const handlePressIn = () => {
    clearTimeout(timerRef.current);
  };

  return (
    <SafeAreaView className="bg-primary">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <PostCard caption={item.caption} thumbnail={item.thumbnail} />}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4 space-y-6">
            <View className="flex justify-between items-start flex-row mb-6">
              <View className="flex items-start flex-col gap-2 -ml-2">
                <Image source={images.sargatypog} className="w-[166px] h-[22px]" resizeMode="contain" />
                <Image source={images.sksm} className="w-[90px] h-[12px]" resizeMode="contain" />
              </View>

              <TouchableOpacity
                activeOpacity={1}
                onLongPress={handleLongPress}
                onPressIn={handlePressIn}
                onPress={handleDoubleClick}
              >
                <Image source={images.sargalayamlogo} className="w-10 h-10 rounded-full" resizeMode="contain" />
              </TouchableOpacity>
            </View>
            <SearchInput />
            

            <View className="mt-2 flex flex-row items-center justify-between gap-2">
              <TouchableOpacity onPress={() => router.push("screens/downloads")}>
                <View className="flex flex-row items-center h-10 px-6 bg-black-100 border-1 border-black-200 rounded-xl">
                  <Text className="text-white font-semibold">Downloads</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("screens/quiz")}>
                <View className="flex flex-row items-center h-10 px-6 bg-black-100 border-1 border-black-200 rounded-xl">
                  {isClicked === false && <View className="absolute top-0 right-0">
                    <Bubble />
                  </View>}
                  <Text className="text-white font-semibold">Online Quiz</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("screens/gallery")}>
                <View className="flex flex-row items-center h-10 px-6 bg-black-100 border-1 border-black-200 rounded-xl">
                  <Text className="text-white font-semibold">Gallery</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-lg font-pregular text-gray-100 mb-3 ml-1">Highlights</Text>
              <Trending posts={hilights ?? []} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => <EmptyState title="No Posts Found" subtitle="No Data uploaded yet" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onEndReached}  // Trigger to load more posts
        onEndReachedThreshold={0.5}  // Trigger when the end of the list is near
      />

      {user && (
        <FloatingAction
          actions={[
            { text: "Add To Gallery", icon: icons.connect, name: "addtogallery", position: 1 },
            { text: "Create Post", icon: icons.plus, name: "createpost", position: 2 },
            { text: "Add Result", icon: icons.result, name: "addresult", position: 3 },
            { text: "Hilights Video", icon: icons.plus, name: "createvideo", position: 4 },
          ]}
          onPressItem={(name) => {
            console.log(`selected button: ${name}`);
            router.push(`/admin/${name}`);
          }}
          style={{ position: 'absolute', bottom: 30, right: 20, zIndex: 999 }}
        />
      )}
    </SafeAreaView>
  );
};

export default Home;
