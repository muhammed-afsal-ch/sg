import { icons, images } from "@/constants";
import { Link, router } from "expo-router";
import { Image, Text, View, ScrollView, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../../context/Globalprovider";

const Connect = () => {
  const { user } = useGlobalContext();

  return (
    <SafeAreaView className="px-4 my-6 bg-primary h-full">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl text-white font-psemibold">Connect Us</Text>

        <View className="flex flex-col gap-3 w-full items-center justify-center">
          <Image
            source={images.sksm}
            className="w-[166px] h-[20px] mt-10"
            resizeMode="contain"
          />
          <Image
            source={images.sargalayamlogo}
            className="w-[70px] h-[70px] mt-5 rounded-full"
            resizeMode="contain"
          />

          <Image
            source={images.sargatypog}
            className="w-[166px] h-[25px]"
            resizeMode="contain"
          />

          <View className="flex flex-col gap-3 w-full items-center justify-center mt-10 px-4">
            <View className="flex flex-row items-center bg-black-100 p-4 rounded-2xl w-full">
              <Image
                source={images.sargachairman}
                className="w-[50px] h-[50px] rounded-full"
                resizeMode="cover"
              />
              <View className="flex flex-col gap-2 p-4 rounded-2xl">
                <Text className="text-white text-lg font-pregular">Chairman :</Text>
                <Text className="text-white text-md font-pmedium">SHAHEER DHESHAMANGALAM</Text>
              </View>
            </View>

            <View className="flex flex-row items-center bg-black-100 p-4 rounded-2xl w-full">
              <Image
                source={images.sargaconvener}
                className="w-[50px] h-[50px] rounded-full"
                resizeMode="cover"
              />
              <View className="flex flex-col gap-2 p-4 rounded-2xl">
                <Text className="text-white text-lg font-pregular">Convener :</Text>
                <Text className="text-white text-md font-pmedium">SULAIMAN UGRAPURAM</Text>
              </View>
            </View>
          </View>

          <View className="mb-16 flex gap-1 flex-row w-full justify-evenly items-center">
            <View className="border-2 border-black-200 rounded-full">
              <TouchableOpacity onPress={() => Linking.openURL("https://sargalayam.in")}>
                <View className="flex flex-row items-center bg-black-100 p-1 px-2 pl-2 rounded-full w-full border-1 border-black-200">
                  <Image
                    source={icons.website}
                    className="w-[25px] h-[25px] rounded-full"
                    resizeMode="cover"
                  />
                  <View className="flex flex-col p-1 py-2">
                    <Text className="text-white text-base font-pbold">sargalayam.in</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View className="border-2 border-black-200 rounded-full">
              <TouchableOpacity onPress={() => router.push("/message")}>
                <View className="flex flex-row items-center bg-black-100 p-1 px-2 pl-2 rounded-full w-full border-1 border-black-200">
                  <Image
                    source={icons.messageus}
                    className="w-[25px] h-[25px] rounded-full"
                    resizeMode="cover"
                  />
                  <View className="flex flex-col p-1 py-2">
                    <Text className="text-white text-base font-pbold">Message to us</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          {user && <Text className="text-sm text-white bg-red-500">{user.email}</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Connect;
