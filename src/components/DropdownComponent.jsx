import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Image } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import useAppwrite from '@/lib/useAppwrite';
import { addNewResult, getAllDistrics, getItemByItemcode } from '@/lib/appwrite';
import { icons } from '@/constants';
import * as DocumentPicker from "expo-document-picker";
import FormField from './FormField';
import CustomButton from './CustomButton';
import { Alert,ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';


const DropdownComponent = () => {

  const { data: districts } = useAppwrite(() => getAllDistrics());
  const [programe, setPrograme] = useState("");
  const [uploadingWaitlist, setUploadingWaitlist] = useState(false);
  const [uploadingPublish, setUploadingPublish] = useState(false);



  const transformedData = districts.map(district => ({
    value: district.districtid,
    label: `${district.districtid} . ${district.name}`,
  }));

  const grades = [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
    { value: "0", label: "0" },
  ];

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
          thumbnail: result.assets[0],
        });
      }

      if (selectType === "video") {
        setForm({
          ...form,
          video: result.assets[0],
        });
      }
    } else {
      setTimeout(() => {
        Alert.alert("Document picked", JSON.stringify(result, null, 2));
      }, 100);
    }
  };

  const [values, setValues] = useState({
    firstDistrict: 0,
    firstGrade: null,
    secondDistrict: 0,
    secondGrade: null,
    thirdDistrict: 0,
    thirdGrade: null,
    resultimage: null,
    itemcode: 0,
    totalFirstDistrictMarks: 0,
    totalSecondDistrictMarks: 0,
    totalThirdDistrictMarks: 0,
    adminId: "67278ccc0013dcad8db3",
  });


  const handleChange = (key, value) => {
    const updatedValues = { ...values, [key]: value };
    setValues(updatedValues);
  };

  const handleButtonClick = () => {
    console.log(values, "this is my data");
    setValues({
      firstDistrict: null,
      firstGrade: null,
      secondDistrict: null,
      secondGrade: null,
      thirdDistrict: null,
      thirdGrade: null,
      resultimage: null
    });
  };

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

  const submit = async (data) => {
    console.log(values, "valaa");
    const {
      itemcode, firstDistrict, secondDistrict, thirdDistrict, firstGrade, secondGrade, thirdGrade,
    } = values;

    if (
      [itemcode, firstDistrict, secondDistrict, thirdDistrict].includes(0) ||
      !firstGrade || firstGrade === "" ||
      !secondGrade || secondGrade === "" ||
      !thirdGrade || thirdGrade === ""
    ) {
      return Alert.alert("Warning", "Please provide all fields");
    }

    const setLoadingState = (actionType) => {
      if (actionType === "publish") {
        setUploadingPublish(true);
        setUploadingWaitlist(false);  // Reset other loading state
      } else {
        setUploadingWaitlist(true);
        setUploadingPublish(false);  // Reset other loading state
      }
    };

    setLoadingState(data ? "publish" : "waitlist");

    try {
      const { category_code, point_category } = await getItemDetails(values.itemcode);
      if (!category_code || !point_category) {
        setPrograme(""); // Reset programe if item is not found
        return Alert.alert("Error", "Item not found");
      }

      // Calculate marks for each district
      const calculateMarks = (category) => {
        let totalFirstDistrictMarks = calculateDistrictMarks(category, values.firstGrade, "First");
        let totalSecondDistrictMarks = calculateDistrictMarks(category, values.secondGrade, "Second");
        let totalThirdDistrictMarks = calculateDistrictMarks(category, values.thirdGrade, "Third");

        return {
          totalFirstDistrictMarks,
          totalSecondDistrictMarks,
          totalThirdDistrictMarks,
        };
      };

      const { totalFirstDistrictMarks, totalSecondDistrictMarks, totalThirdDistrictMarks } = category_code === "T.G" || category_code === "G.G"
        ? calculateMarks("Group")
        : calculateMarks(point_category);

      setValues(prevValues => ({
        ...prevValues,
        totalFirstDistrictMarks,
        totalSecondDistrictMarks,
        totalThirdDistrictMarks,
      }));

      // setValues(prevValues => ({ ...prevValues, publish: data }));
      console.log("state", data);

      const resultObject = {
        publish: data,
        ...values,
        firstmark: totalFirstDistrictMarks,
        secondmark: totalSecondDistrictMarks,
        thirdmark: totalThirdDistrictMarks,
        adminId: "67278ccc0013dcad8db3",
      };

      const addResult = await addNewResult(resultObject);
      console.log(addResult, "result uploaded");

      Alert.alert("Success", "Result uploaded successfully");
      router.push("/home");

    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message);
    } finally {
      setUploadingPublish(false);
      setUploadingWaitlist(false);
      setPrograme("")

      setValues({
        firstDistrict: 0,
        firstGrade: null,
        secondDistrict: 0,
        secondGrade: null,
        thirdDistrict: 0,
        thirdGrade: null,
        resultimage: null,
        itemcode: 0,
        totalFirstDistrictMarks: 0,
        totalSecondDistrictMarks: 0,
        totalThirdDistrictMarks: 0,
        publish: false,
        adminId: "67278ccc0013dcad8db3",
      })
    }

  }


  const renderDropdown = (label, districtKey, gradeKey) => (
    <View className="bg-primary flex flex-row mt-7 w-full">
      <View className="w-[280px] mr-2">
        <Text className="text-base text-gray-100 font-pmedium">{label}</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={transformedData}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={`Select ${label}`}
          searchPlaceholder="Search..."
          value={values[districtKey]}
          onChange={(item) => handleChange(districtKey, item.value)}
        />
      </View>
      <View className="w-[70px]">
        <Text className="text-base text-gray-100 font-pmedium">Grade</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={grades}
          search={false}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="G"
          value={values[gradeKey]}
          onChange={(item) => handleChange(gradeKey, item.value)}
        />
      </View>
    </View>
  );

  return (
    <>
      <SafeAreaView className="bg-primary h-full">
        <ScrollView>

          <View className="mt-7 space-y-2">

            <Text className="text-2xl text-white font-psemibold">Add New Result</Text>

            <FormField
              title="Item Code"
              value={values.itemcode === 0 ? "" : values.itemcode}
              placeholder="Enter item code of programe..."
              handleChangeText={async (e) => {
                await setValues({ ...values, itemcode: Number(e) })
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

            <Text className="text-base text-gray-100 font-pmedium mt-10">
              Result Image
            </Text>

            <TouchableOpacity onPress={() => openPicker("image")}>
              {values.resultimage ? (
                <Image
                  source={{ uri: values.resultimage.uri }}
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

          {renderDropdown('First District', 'firstDistrict', 'firstGrade')}
          {renderDropdown('Second District', 'secondDistrict', 'secondGrade')}
          {renderDropdown('Third District', 'thirdDistrict', 'thirdGrade')}
          {/* <Button title="Reset All Dropdowns" onPress={handleButtonClick} /> */}

          <View className="flex flex-row  w-full gap-1 justify-evenly  mb-[10px]">
            <CustomButton
              title="Waitlist"
              handlePress={() => {
                submit(false);
              }}
              containerStyles="mt-7 w-[48%]"
              isLoading={uploadingWaitlist}
              textStyles={"text-white"}
            />
            <CustomButton
              title="Publish"
              handlePress={() => {
                submit(true);
              }}
              containerStyles="mt-7 w-[48%] "
              isLoading={uploadingPublish}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: 'gray',
    backgroundColor: "white",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
});
