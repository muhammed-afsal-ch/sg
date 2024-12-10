import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Pressable, Linking, Image, RefreshControl, Text, TouchableOpacity, View, BackHandler } from "react-native";
import { icons, images } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getAllPosts, getLatestThreePosts, getItemByItemcode, getLatestPosts } from "../../lib/appwrite";
import { EmptyState, SearchInput, Trending, VideoCard } from "../../components";
import { router } from "expo-router";
import { FloatingAction } from "react-native-floating-action";
import Bubble from "@/components/Bubble";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalContext } from "../../context/Globalprovider";
import PostCard from "@/components/PostCard";


//background-image: linear-gradient(90deg, #ea8f23, #ea3650 33%, #2075bc 66%, #09abb1);
//https://www.youtube.com/watch?v=upccWfK_0DI
// /https://www.geeksforgeeks.org/how-to-convert-an-expo-app-to-apk-in-react-native-for-android/
// "expo-av": "~13.10.5","~13.4.1"
const Home = () => {
  const { user } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(getAllPosts);

  const [hilights, setHilights] = useState([]);

  const { data: latestAllResults } = useAppwrite(getLatestThreePosts);
  const [fullResults, setFullResults] = useState([]);


  const [isClicked, setIsClicked] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const actions = [
    {
      text: "Accessibility",
      icon: icons.connect,
      name: "bt_accessibility",
      position: 1
    },
    {
      text: "Create Post",
      icon: icons.plus,
      name: "createpost",
      position:2
    },
    {
      text: "Add Result",
      icon: icons.result,
      name: "addresult",
      position: 3
    },
    {
      text: "Hilights Video",
      icon: icons.plus,
      name: "createvideo",
      position: 4
    }
  ];

  useEffect(() => {
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

      const getHilights= async()=>{
        getLatestPosts().then((data)=>{
          setHilights(data)
        })
      }

      setFullResults(updatedResults);
      getHilights()
    };

    fetchAdditionalData();
  }, [latestAllResults]);


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
        className=""
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <PostCard
            caption={item.caption}
            thumbnail={item.thumbnail}
          />
        )}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4 space-y-6">
            <View className="flex justify-between items-start flex-row mb-6">
              <View className="flex items-start flex-col gap-2 -ml-2">
                <Image
                  source={images.sargatypog}
                  className="w-[166px] h-[22px]  "
                  resizeMode="contain"
                />

                <Image
                  source={images.sksm}
                  className="w-[90px] h-[12px]  "
                  resizeMode="contain"
                />
              </View>

              <TouchableOpacity
                activeOpacity={1}
                onLongPress={handleLongPress}
                onPressIn={handlePressIn}
                onPress={handleDoubleClick}
              >
                <Image
                  source={images.sargalayamlogo}
                  className="w-10 h-10 rounded-full"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <SearchInput />
            <View className="mt-2 flex flex-row items-center justify-between gap-2">
              <View className="border-2 border-black-200 rounded-xl">
                <TouchableOpacity
                  onPress={() => router.push("/downloads")} 
                >
                  <View className="flex flex-row items-center h-10 px-6 bg-black-100 border-1 border-black-200 rounded-xl">
                    <Text className="text-white font-semibold">Downloads</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View className="border-2 border-black-200 rounded-xl">
                <TouchableOpacity
                  onPress={() => router.push("/quiz")}
                >
                  <View className="flex flex-row items-center h-10 px-6 bg-black-100 border-1 border-black-200 rounded-xl">
                    {isClicked === false && (
                      <View className="absolute top-0 right-0">
                        <Bubble />
                      </View>
                    )}
                    <Text className="text-white font-semibold">Online Quiz</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View className="border-2 border-black-200 rounded-xl">
                <TouchableOpacity
                  onPress={() => router.push("/gallery")}
                >
                  <View className="flex flex-row items-center h-10 px-6 bg-black-100 border-1 border-black-200 rounded-xl">
                    <Text className="text-white font-semibold">Gallery</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-lg font-pregular text-gray-100 mb-3 ml-1">
                Highlights
              </Text>

              <Trending posts={hilights ?? []} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Results Found"
            subtitle="No Results uploaded yet"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {user && (
        <FloatingAction
          actions={actions}
          onPressItem={name => {
            console.log(`selected button: ${name}`);
            router.push(`/admin/${name}`)
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

export default Home;
