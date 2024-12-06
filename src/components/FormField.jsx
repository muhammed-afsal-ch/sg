import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";

import { icons } from "../constants";

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  titleStyles,
  otherStyles,
  error,
  onBlurFunction,
  edit,
  keyboardType,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className={`text-base font-pmedium ${titleStyles ? titleStyles : 'text-gray-100'}`}>{title}</Text>

      <View className={`w-full h-16 ${title === 'Message' ? "h-40 items-start" : 'h-16 item-center'} px-4 bg-black-100 rounded-2xl ${edit === false ? "border-1 border-blue-300 opacity-95	" : "border-2 border-black-200"}  focus:border-secondary flex flex-row `}>
        <TextInput
          className="flex-1 text-white font-psemibold text-base"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7B7B8B"
          onChangeText={handleChangeText}
          secureTextEntry={title === "Password" && !showPassword}
          {...props}
          keyboardType={keyboardType}
          multiline={title === "Message" ? true : false}
          numberOfLines={title === "Message" ? 4 : 1} 
          editable={edit}
          onBlur={onBlurFunction}
        />

        {title === "Password" && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}
          className="mt-4">
            <Image
              source={!showPassword ? icons.eye : icons.eyeHide}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        
      </View>
      {error ? (
        <Text className="">{error}</Text>
      ) : () => {
        return null
      }}
    </View>
  );
};

export default FormField;
