import React, { useState,useEffect } from "react";
import { router } from "expo-router";
import { ResizeMode, Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { icons } from "../../constants";
import { addNewResult, createVideoPost, getAllDistrics, getItemByItemcode } from "../../lib/appwrite";
import { CustomButton, FormField } from "../../components";
import { useGlobalContext } from "../../context/Globalprovider";

import { SelectList } from 'react-native-dropdown-select-list'
import useAppwrite from "@/lib/useAppwrite";



//https://www.npmjs.com/package/react-native-floating-action#expo-example

const Result = () => {
  const [submitted,setSubmitted] = useState(false)

  useEffect(() => {
    console.log(form,"first");
  }, submitted)
  
const { user } = useGlobalContext();
const [selected, setSelected] = React.useState("")
const [programe, setPrograme] = useState("");
const [uploading, setUploading] = useState(false);
const [form, setForm] = useState({
  itemcode: 0,
  resultimage: null,
  firstgrade: "",
  secondgrade: "",
  thirdgrade: "",
  firstdistrictid: 0,
  seconddistrictid: 0,
  thirddistrictid: 0,
  totalFirstDistrictMarks: 0,
  totalSecondDistrictMarks: 0,
  totalThirdDistrictMarks: 0,
  publish: false,
  adminId: "67278ccc0013dcad8db3",
});

const { data: districts } = useAppwrite(() => getAllDistrics());
const transformedData = districts.map(district => ({
  key: district.districtid,
  value: `${district.districtid} . ${district.name}`,
}));

const grades = [
  { key: "1", value: "A" },
  { key: "2", value: "B" },
  { key: "3", value: "C" },
  { key: "0", value: "0" },
];

// Helper function to calculate the score based on grade and position
const calculateDistrictMarks = (category, grade, position) => {
  const scoreTable = {
    A: { position: { First: 10, Second: 7, Third: 5 }, grade: { A: 5, B: 3, C: 1 } },
    B: { position: { First: 7, Second: 5, Third: 3 }, grade: { A: 5, B: 3, C: 1 } },
    C: { position: { First: 5, Second: 3, Third: 1 }, grade: { A: 5, B: 3, C: 1 } },
    Group: { position: { First: 10, Second: 7, Third: 5 }, grade: { A: 10, B: 8, C: 6 } },
  };
  
  const positionScore = scoreTable[category].position[position];
  const gradeScore = scoreTable[category].grade[grade];
  return positionScore + gradeScore;
};

// Function to fetch item details based on itemcode
const getItemDetails = async (itemcode) => {
  try {
    const res = await getItemByItemcode(itemcode);
    if (!res) return null;

    const { category_code, point_category } = res;
    return { category_code, point_category };
  } catch (error) {
    console.error("Error fetching item details:", error);
    return null;
  }
};

// Function to handle form submission
const submit = async (data) => {
  // Validation: check if all required fields are provided
  const {
    itemcode, firstdistrictid, seconddistrictid, thirddistrictid, firstgrade, secondgrade, thirdgrade,
  } = form;

  if ([itemcode, firstdistrictid, seconddistrictid, thirddistrictid].includes(0) || !firstgrade || !secondgrade || !thirdgrade) {
    return Alert.alert("Warning", "Please provide all fields");
  }

  setForm(prevForm => ({ ...prevForm, publish: data }));

  // Start uploading
  setUploading(true);

  try {
    const { category_code, point_category } = await getItemDetails(form.itemcode);
    if (!category_code || !point_category) {
      setPrograme(""); // Reset programe if item is not found
      return Alert.alert("Error", "Item not found");
    }

    // Calculate marks for each district
    const calculateMarks = (category) => {
      let totalFirstDistrictMarks = calculateDistrictMarks(category, form.firstgrade, "First");
      let totalSecondDistrictMarks = calculateDistrictMarks(category, form.secondgrade, "Second");
      let totalThirdDistrictMarks = calculateDistrictMarks(category, form.thirdgrade, "Third");

      return {
        totalFirstDistrictMarks,
        totalSecondDistrictMarks,
        totalThirdDistrictMarks,
      };
    };

    const { totalFirstDistrictMarks, totalSecondDistrictMarks, totalThirdDistrictMarks } = category_code === "T.G" || category_code === "G.G"
      ? calculateMarks("Group")
      : calculateMarks(point_category);

    // Update form state with calculated marks
    setForm(prevForm => ({
      ...prevForm,
      totalFirstDistrictMarks,
      totalSecondDistrictMarks,
      totalThirdDistrictMarks,
    }));

    // Prepare result object to submit
    const resultObject = {
      ...form,
      firstmark: totalFirstDistrictMarks,
      secondmark: totalSecondDistrictMarks,
      thirdmark: totalThirdDistrictMarks,
      adminId: "67278ccc0013dcad8db3",
    };

    console.log(resultObject, "resultObject");

    // Submit the result
    const addResult = await addNewResult(resultObject);
    console.log(addResult, "result uploaded");

    Alert.alert("Success", "Result uploaded successfully");
    router.push("/home");
    
    setSelected("")
    setPrograme("")
    setForm({
      itemcode: 0,
      resultimage: null,
      firstgrade: "",
      secondgrade: "",
      thirdgrade: "",
      firstdistrictid: 0,
      seconddistrictid: 0,
      thirddistrictid: 0,
      totalFirstDistrictMarks: 0,
      totalSecondDistrictMarks: 0,
      totalThirdDistrictMarks: 0,
      publish: false,
      adminId: "67278ccc0013dcad8db3",
    });
    

  } catch (error) {
    console.error(error);
    Alert.alert("Error", error.message);
  } finally {
    console.log(form,"creal");
    setSubmitted(true)
    setUploading(false);

    // Reset form state after submission
    // if (!programe) {
    //   setForm({
    //     itemcode: 0,
    //     resultimage: null,
    //     firstgrade: "",
    //     secondgrade: "",
    //     thirdgrade: "",
    //     firstdistrictid: 0,
    //     seconddistrictid: 0,
    //     thirddistrictid: 0,
    //     totalFirstDistrictMarks: 0,
    //     totalSecondDistrictMarks: 0,
    //     totalThirdDistrictMarks: 0,
    //     publish: false,
    //     adminId: "67278ccc0013dcad8db3",
    //   });
    // }
  }
};

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold">Add New Result</Text>

        <FormField
          title="Item Code"
          value={form.itemcode === 0 ?"" : form.itemcode}
          placeholder="Enter item code of programe..."
          handleChangeText={async (e) => {
            await setForm({ ...form, itemcode: Number(e) })
            if (e) {
              const programe = await getItemByItemcode(Number(e)).then((res) => {
                if (res === false) {
                  setPrograme("")
                } else {
                  setPrograme(`${res.itemlabel}  | ${res.category_code}`)
                }
              })
            } else {
              setPrograme("")
            }
          }}
          otherStyles="mt-10"
          onBlurFunction={async () => {

          }}
        />

        {programe !== "" ? (
          <FormField
            title="Programe"
            edit={false}
            value={programe === "" ? "" : programe}
            placeholder="Enter item code first..."
            otherStyles="mt-10"
          />
        ) : () => {
          return null
        }}

        {/* <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Upload Video
          </Text>

          <TouchableOpacity onPress={() => openPicker("video")}>
            {form.video ? (
              <Video
                source={{ uri: form.video.uri }}
                className="w-full h-64 rounded-2xl"
                useNativeControls
                resizeMode={ResizeMode.COVER}
                isLooping
              />
            ) : (
              <View className="w-full h-40 px-4 bg-black-100 rounded-2xl border border-black-200 flex justify-center items-center">
                <View className="w-14 h-14 border border-dashed border-secondary-100 flex justify-center items-center">
                  <Image
                    source={icons.upload}
                    resizeMode="contain"
                    alt="upload"
                    className="w-1/2 h-1/2"
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View> */}

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Result Image
          </Text>

          <TouchableOpacity onPress={() => openPicker("image")}>
            {form.resultimage ? (
              <Image
                source={{ uri: form.resultimage.uri }}
                resizeMode="cover"
                className="w-full h-64 rounded-2xl"
              />
            ) : (
              <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 flex justify-center items-center flex-row space-x-2">
                <Image
                  source={icons.upload}
                  resizeMode="contain"
                  alt="upload"
                  className="w-5 h-5"
                />
                <Text className="text-sm text-gray-100 font-pmedium">
                  Choose a file
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-7 space-y-2 flex flex-row w-full">
          <View className="w-[280px] mr-2">
            <Text className="text-base text-gray-100 font-pmedium">
              First District
            </Text>

            <SelectList
              className="text-white bg-white"
              setSelected={(val) => setSelected(val) }
              defaultOption={ selected === "" ? { key: "0", value: "Select First District" } : ""}
              data={transformedData}
              save="value"
              boxStyles={{ backgroundColor: "white" }} dropdownStyles={{ backgroundColor: "white", padding: "2px" }}
              dropdownTextStyles={{ color: "black" }}
              dropdownItemStyles={{ backgroundColor: "white", marginTop: 5 }}
              onSelect={() => {
                const selectedDistrictid = parseInt(selected.split(' ')[0]);
                console.log(selected,"nihaal");
                setForm({ ...form, firstdistrictid: selectedDistrictid });
              }}
            />
          </View>


          <View className="">
            <Text className="text-base text-gray-100 font-pmedium gap-2">
              Grade
            </Text>

            <SelectList
              className="text-white bg-white"
              setSelected={(val) => setSelected(val)}
              data={grades}
              search={false}
              save="value"
              boxStyles={{ backgroundColor: "white" }} dropdownStyles={{ backgroundColor: "white", padding: "2px" }}
              dropdownTextStyles={{ color: "black" }}
              dropdownItemStyles={{ backgroundColor: "white", marginTop: 5 }}
              placeholder="G"
              onSelect={() => {
                setForm({ ...form, firstgrade: selected });
              }}
            />
          </View>

        </View>

        <View className="mt-7 space-y-2 flex flex-row w-full">
          <View className="w-[280px] mr-2">
            <Text className="text-base text-gray-100 font-pmedium">
              Second District
            </Text>

            <SelectList
              className="text-white bg-white"
              setSelected={(val) => setSelected(val)}
              data={transformedData}
              save="value"
              boxStyles={{ backgroundColor: "white" }} dropdownStyles={{ backgroundColor: "white", padding: "2px" }}
              dropdownTextStyles={{ color: "black" }}
              dropdownItemStyles={{ backgroundColor: "white", marginTop: 5 }}
              placeholder="Select Second District"
              onSelect={() => {
                const selectedDistrictid = parseInt(selected.split(' ')[0]);
                setForm({ ...form, seconddistrictid: selectedDistrictid });
              }}
            />
          </View>


          <View className="">
            <Text className="text-base text-gray-100 font-pmedium gap-2">
              Grade
            </Text>

            <SelectList
              className="text-white bg-white"
              setSelected={(val) => setSelected(val)}
              data={grades}
              search={false}
              save="value"
              boxStyles={{ backgroundColor: "white" }} dropdownStyles={{ backgroundColor: "white", padding: "2px" }}
              dropdownTextStyles={{ color: "black" }}
              dropdownItemStyles={{ backgroundColor: "white", marginTop: 5 }}
              placeholder="G"
              onSelect={() => {
                setForm({ ...form, secondgrade: selected });
              }}
            />
          </View>

        </View>

        <View className="mt-7 space-y-2 flex flex-row w-full">
          <View className="w-[280px] mr-2">
            <Text className="text-base text-gray-100 font-pmedium">
              Third District
            </Text>

            <SelectList
              className="text-white bg-white"
              setSelected={(val) => setSelected(val)}
              data={transformedData}
              save="value"
              boxStyles={{ backgroundColor: "white" }} dropdownStyles={{ backgroundColor: "white", padding: "2px" }}
              dropdownTextStyles={{ color: "black" }}
              dropdownItemStyles={{ backgroundColor: "white", marginTop: 5 }}
              placeholder="Select Third District"
              onSelect={() => {
                const selectedDistrictid = parseInt(selected.split(' ')[0]);
                setForm({ ...form, thirddistrictid: selectedDistrictid });
              }}
            />
          </View>


          <View className="">
            <Text className="text-base text-gray-100 font-pmedium gap-2">
              Grade
            </Text>

            <SelectList
              className="text-white bg-white"
              setSelected={(val) => setSelected(val)}
              data={grades}
              search={false}
              save="value"
              boxStyles={{ backgroundColor: "white" }} dropdownStyles={{ backgroundColor: "white", padding: "2px" }}
              dropdownTextStyles={{ color: "black" }}
              dropdownItemStyles={{ backgroundColor: "white", marginTop: 5 }}
              placeholder="G"
              onSelect={() => {
                setForm({ ...form, thirdgrade: selected });
              }}
            />
          </View>

        </View>

        <View className="flex flex-row  w-full gap-1 justify-between">
          <CustomButton
            title="Waitlist"
            handlePress={ () => {
              submit(false);
            }}
            containerStyles="mt-7 w-[48%]"
            isLoading={uploading}
            textStyles={"text-white"}
          />
          <CustomButton
            title="Publish"
            handlePress={ () => {
              submit(true);
            }}
            containerStyles="mt-7 w-[48%] "
            isLoading={uploading}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Result;
