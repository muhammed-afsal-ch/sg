import { icons, images } from "@/constants";
import { router } from "expo-router";
import { Image, Text, View, ScrollView, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../../context/Globalprovider";

const ContactCard = ({ title, name, phone }) => (
  <View className="flex flex-row items-center bg-black-100 p-4 rounded-2xl w-full relative">
    <Image
      source={images.sargalayamlogo}
      className="w-[50px] h-[50px] rounded-full"
      resizeMode="cover"
    />
    <View className="flex flex-col gap-2 p-4 rounded-2xl">
      <Text className="text-white text-lg font-pregular">{title}:</Text>
      <Text className="text-white text-md font-pmedium">{name}</Text>
    </View>
    <View className="absolute top-15 right-5">
      <TouchableOpacity onPress={() => Linking.openURL(`tel:${phone}`)} className="p-2">
        <Image
          source={images.call}
          className="w-[20px] h-[20px] rounded-full"
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  </View>
);

const ActionButton = ({ icon, label, onPress }) => (
  <View className="border-2 border-black-200 rounded-full">
    <TouchableOpacity onPress={onPress}>
      <View className="flex flex-row items-center bg-black-100 p-1 px-2 pl-2 rounded-full w-full border-1 border-black-200">
        <Image source={icon} className="w-[25px] h-[25px] rounded-full" resizeMode="cover" />
        <View className="flex flex-col p-1 py-2">
          <Text className="text-white text-base font-pbold">{label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  </View>
);

const Connect = () => {
  const { user } = useGlobalContext();

  return (
    <SafeAreaView className="px-4 bg-primary h-full">
      <Text className="text-2xl text-white font-psemibold mb-4 px-4 my-6">Connect Us</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
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

          {/* Contact Cards */}
          <View className="flex flex-col gap-3 w-full items-center justify-center mt-10 px-4">
            <ContactCard title="Chairman" name="SHAFI MASTER ATTIRI" phone="+917561887699" />
            <ContactCard title="Working Chairman" name="KUNJI MUHAMMED FAISY MOLUR" phone="+919946519863" />
            <ContactCard title="General Convener" name="SULAIMAN MAHIRI UGRAPURAM" phone="+919495177323" />
          </View>

          {/* Action Buttons */}
          <View className="mb-16 flex gap-1 flex-row w-full justify-evenly items-center">
            <ActionButton icon={icons.website} label="sargalayam.in" onPress={() => Linking.openURL("https://sargalayam.in")} />
            <ActionButton icon={icons.messageus} label="Message to us" onPress={() => router.push("screens/message")} />
          </View>

          {/* User Email */}
          {user && <Text className="text-sm text-white bg-red-500">{user.email}</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Connect;
