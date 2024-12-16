import { useState } from "react";
import { router } from "expo-router";
import { View, TouchableOpacity, Image, TextInput } from "react-native";

import { icons } from "../constants";

const SearchInput = () => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query === "") return;

    router.push(`/results?homequery=${query}`);
    setQuery("");
  };

  return (
    <View className="flex flex-row items-center space-x-4 w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary">
      <TextInput
        className="text-base mt-0.5 text-white flex-1 font-pregular"
        value={query}
        placeholder="Search any results"
        placeholderTextColor="#CDCDE0"
        onChangeText={setQuery}
      />
      <TouchableOpacity onPress={handleSearch}>
        <Image source={icons.search} className="w-5 h-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;