import React, { useState } from "react";
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
  const { user } = useGlobalContext();
  const [programe, setPrograme] = useState("")
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
    adminId: "67278ccc0013dcad8db3"
  });

  const [selected, setSelected] = React.useState("");

  const { data: districts } = useAppwrite(() => getAllDistrics());

  // {key:'1', value:'Mobiles', disabled:true},

  const transformedData = districts.map(district => ({
    key: district.districtid,
    value: `${district.districtid} . ${district.name}`
  }));

  const grades = [
    { key: '1', value: 'A' },
    { key: '2', value: 'B' },
    { key: '3', value: 'C' },
    { key: '0', value: '0' },
  ]

  const openPicker = async (selectType) => {
    const result = await DocumentPicker.getDocumentAsync({
      type:
        selectType === "image"
          ? ["image/png", "image/jpg"]
          : ["video/mp4", "video/gif"],
    });

    if (!result.canceled) {

      if (selectType === "image") {
        setForm({
          ...form,
          resultimage: result.assets[0],
        });
      }
    } else {
      setTimeout(() => {
        Alert.alert("Document picked", JSON.stringify(result, null, 2));
      }, 100);
    }
  };


  const submit = async (data) => {
    if (

      form.itemcode === null |
      // form.resultimage === null |
      form.firstdistrictid === null |
      form.seconddistrictid === null |
      form.thirddistrictid === null |
      form.firstgrade === "" |
      form.secondgrade === "" |
      form.thirdgrade === ""
      // !form.resultimage

    ) {
      return Alert.alert("Warning", "Please provide all fields");
    }

    if (data === false) {
       setForm({ ...form, publish: false });
    }else{
      setForm({ ...form, publish: true });
    }

    const scoreTable = {
      A: {  // Category A
        position: { First: 10, Second: 7, Third: 5 },
        grade: { A: 5, B: 3, C: 1 }
      },
      B: {  // Category B
        position: { First: 7, Second: 5, Third: 3 },
        grade: { A: 5, B: 3, C: 1 }
      },
      C: {  // Category C
        position: { First: 5, Second: 3, Third: 1 },
        grade: { A: 5, B: 3, C: 1 }
      },
      Group: {  // Group categories (GG, TG, etc.)
        position: { First: 10, Second: 7, Third: 5 },
        grade: { A: 10, B: 8, C: 6 }
      }
    };


  
    setUploading(true);
  
    try {
      const calculateMarks = async () => {
        const itemcode = Number(form.itemcode);
  
        const getItem = async () => {
          const res = await getItemByItemcode(itemcode);
  
          if (res) {
            const { category_code, point_category, status } = res;
            console.log(category_code, point_category, status, "undd");
  
            let totalFirstDistrictMarks = 0;
            let totalSecondDistrictMarks = 0;
            let totalThirdDistrictMarks = 0;
  
            const { firstgrade, secondgrade, thirdgrade } = form;
  
            if (category_code === "T.G" && point_category === "A" || category_code === "G.G" && point_category === "A") {
  
              const firstPositionScore = scoreTable.Group.position.First;
              const firstGradeScore = scoreTable.Group.grade[firstgrade];
              totalFirstDistrictMarks = firstPositionScore + firstGradeScore;
  
              const secondPositionScore = scoreTable.Group.position.Second;
              const secondGradeScore = scoreTable.Group.grade[secondgrade];
              totalSecondDistrictMarks += secondPositionScore + secondGradeScore;
  
              const thirdPositionScore = scoreTable.Group.position.Third;
              const thirdGradeScore = scoreTable.Group.grade[thirdgrade];
              totalThirdDistrictMarks += thirdPositionScore + thirdGradeScore;
  
            } else {
  
              const firstPositionScore = scoreTable[point_category].position.First;
              const firstGradeScore = scoreTable[point_category].grade[firstgrade];
              totalFirstDistrictMarks = firstPositionScore + firstGradeScore;
  
              const secondPositionScore = scoreTable[point_category].position.Second;
              const secondGradeScore = scoreTable[point_category].grade[secondgrade];
              totalSecondDistrictMarks += secondPositionScore + secondGradeScore;
  
              const thirdPositionScore = scoreTable[point_category].position.Third;
              const thirdGradeScore = scoreTable[point_category].grade[thirdgrade];
              totalThirdDistrictMarks += thirdPositionScore + thirdGradeScore;
  
            }
  
            console.log(totalFirstDistrictMarks, totalSecondDistrictMarks, totalThirdDistrictMarks);
  
            setForm({
              ...form,
              totalFirstDistrictMarks:totalFirstDistrictMarks,
              totalSecondDistrictMarks:totalSecondDistrictMarks,
              totalThirdDistrictMarks:totalThirdDistrictMarks,
            });
          } else {
            setPrograme(""); // Set programe to empty if item not found
          }
        };
  
        await getItem();
      };
  
      await calculateMarks();
  
      const resultObject = {
        itemcode: form.itemcode,
        resultimage: form.resultimage,
        firstgrade: form.firstgrade,
        secondgrade: form.secondgrade,
        thirdgrade: form.thirdgrade,
        publish: form.publish,
        firstdistrict: form.firstdistrictid,
        seconddistrict: form.seconddistrictid,
        thirddistrict: form.thirddistrictid,
        firstmark: form.totalFirstDistrictMarks,
        secondmark: form.totalSecondDistrictMarks,
        thirdmark: form.totalThirdDistrictMarks,
        // adminId: user?.id,
        adminId: "67278ccc0013dcad8db3",
      }
  console.log(resultObject,"objee");
      const addResult = await addNewResult(resultObject);
      console.log(addResult, "result upload");
  
      Alert.alert("Success", "Result uploaded successfully");
      router.push("/home");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message);
    } finally {
      setUploading(false);
  
      // Reset form state only after programe update (if applicable)
      if (!programe) {
        setForm(
          {
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
            adminId: "67278ccc0013dcad8db3"
          }
        )
      }
    }
  };


  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold">Add New Result</Text>

        <FormField
          title="Item Code"
          value={form.itemcode}
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

        {programe ? (
          <FormField
            title="Programe"
            edit={false}
            value={programe}
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
              setSelected={(val) => setSelected(val)}
              data={transformedData}
              save="value"
              boxStyles={{ backgroundColor: "white" }} dropdownStyles={{ backgroundColor: "white", padding: "2px" }}
              dropdownTextStyles={{ color: "black" }}
              dropdownItemStyles={{ backgroundColor: "white", marginTop: 5 }}
              placeholder="Select First District"
              onSelect={() => {
                const selectedDistrictid = parseInt(selected.split(' ')[0]);
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
