import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useAppwrite from "@/lib/useAppwrite";
import {
  getResultByItemcode,
  updateResult,
  getItemByItemcode,
  getAllDistrics,
} from "@/lib/appwrite";
import { icons } from "@/constants";
import * as ImagePicker from "expo-image-picker";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { Dropdown } from "react-native-element-dropdown";
import { useGlobalContext } from "../../context/Globalprovider";

const EditResult = () => {
  const { editresult } = useLocalSearchParams(); // Get the editresult parameter (itemcode or result ID)
  const [programe, setPrograme] = useState("");
  const { user } = useGlobalContext();

  const getprograme = () => getItemByItemcode(Number(editresult)).then((res) => {
    if (res === false) {
      setPrograme("")
    } else {
      setPrograme(`${res.itemlabel}  | ${res.category_code}`)
    }
  })

  // State for holding the result data
  const [values, setValues] = useState({
    itemcode: 0,
    resultid: "",
    firstDistrict: 0,
    firstGrade: null,
    secondDistrict: 0,
    secondGrade: null,
    thirdDistrict: 0,
    thirdGrade: null,
    resultimage: null,
    totalFirstDistrictMarks: 0,
    totalSecondDistrictMarks: 0,
    totalThirdDistrictMarks: 0,
  });

  const [newItemCode, setNewItemCode] = useState(0)

  // Fetch result and districts data
  const { data: result, error: resultError } = useAppwrite(() =>
    getResultByItemcode(editresult)
  );
  const { data: districts, error: districtsError } = useAppwrite(() =>
    getAllDistrics()
  );

  // Populate values with the fetched result
  useEffect(() => {
    if (result) {
      setValues({
        itemcode: result.itemcode,
        resultid: result.$id,
        firstDistrict: result.firstdistrict,
        firstGrade: result.firstgrade,
        secondDistrict: result.seconddistrict,
        secondGrade: result.secondgrade,
        thirdDistrict: result.thirddistrict,
        thirdGrade: result.thirdgrade,
        resultimage: result.resultimage,
        totalFirstDistrictMarks: result.firstmark,
        totalSecondDistrictMarks: result.secondmark,
        totalThirdDistrictMarks: result.thirdmark,
      });
    }
    getprograme()
  }, [result]);

  // Handle state change
  const handleChange = (key, value) => {
    setValues((prevValues) => ({ ...prevValues, [key]: value }));
  };

  // Open image picker
  const openPicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setValues((prevValues) => ({
        ...prevValues,
        resultimagenew: result.assets[0],
      }));
    } else {
      Alert.alert("No file selected");
    }
  };

  const calculateDistrictMarks = (category, grade, position) => {
    const scoreTable = {
      A: { position: { First: 10, Second: 7, Third: 5 }, grade: { A: 5, B: 3, C: 1, 0: 0 } },
      B: { position: { First: 7, Second: 5, Third: 3 }, grade: { A: 5, B: 3, C: 1, 0: 0 } },
      C: { position: { First: 5, Second: 3, Third: 1 }, grade: { A: 5, B: 3, C: 1, 0: 0 } },
      Group: { position: { First: 10, Second: 7, Third: 5 }, grade: { A: 10, B: 8, C: 6, 0: 0 } },
    };

    const positionScore = scoreTable[category].position[position];
    const gradeScore = scoreTable[category].grade[grade];
    return positionScore + gradeScore;
  };

  // Submit the updated result
  const submit = async () => {
    const { category_code, point_category } = await getItemByItemcode(values.itemcode);

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

    const { totalFirstDistrictMarks, totalSecondDistrictMarks, totalThirdDistrictMarks } =
      category_code === "T.G" || category_code === "G.G"
        ? calculateMarks("Group")
        : calculateMarks(point_category);

    console.log(totalFirstDistrictMarks, totalSecondDistrictMarks, totalThirdDistrictMarks, "olakka");

    setValues((prevValues) => ({
      ...prevValues, // Merge with previous state
      totalFirstDistrictMarks: totalFirstDistrictMarks,
      totalSecondDistrictMarks: totalSecondDistrictMarks,
      totalThirdDistrictMarks: totalThirdDistrictMarks,
    }));

    const resultObject = {
      resultid: values.resultid,
      firstGrade: values.firstGrade,
      secondGrade: values.secondGrade,
      thirdGrade: values.thirdGrade,
      firstDistrict: values.firstDistrict,
      secondDistrict: values.secondDistrict,
      thirdDistrict: values.thirdDistrict,
      firstmark: totalFirstDistrictMarks,
      secondmark: totalSecondDistrictMarks,
      thirdmark: totalThirdDistrictMarks,
      adminId: user.$id,
    };

    if (values.resultimagenew) {
      resultObject.resultimage = values.resultimagenew;
    }

    resultObject.itemcode = newItemCode !== 0 ? newItemCode : values.itemcode;

    try {
      console.log(resultObject, "ob");
      await updateResult(resultObject);
      Alert.alert("Success", "Result updated successfully");
      router.push("/home");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update result");
    }
  };


  // Transform district data for the dropdown
  const transformedData = districts
    ? districts.map((district) => ({
      value: district.districtid,
      label: `${district.districtid} . ${district.name}`,
    }))
    : [];

  const transformedGetData = districts
    ? districts.reduce((acc, district) => {
      acc[district.districtid] = `${district.districtid} . ${district.name}`;
      return acc;
    }, {})
    : {};


  // Grades for the dropdown
  const grades = [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
    { value: "0", label: "0" },
  ];

  // Render dropdown with districts and grades
  const renderDropdown = (label, districtKey, gradeKey) => {
    // Find the selected district's label from the transformed data
    // const selectedDistrictLabel =
    //   transformedData.find((item) => item.value === values[districtKey])
    //     ?.label || "Select District"; // Default to "Select District" if no match is found

    // console.log(
    //   `Rendering Dropdown: ${label}, Key: ${districtKey}, Value: ${values[districtKey]}, Selected Label: ${selectedDistrictLabel}`
    // );

    return (
      <View className="bg-primary flex flex-row justify-evenly mt-7 w-full px-4">
        {/* Dropdown for District */}
        <View className="w-[75%] mr-2">
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
            placeholder={values[districtKey] ? transformedGetData[values[districtKey]] : "Select Grade"} // Use the dynamically selected label
            value={values[districtKey]} // Current value from state
            onChange={(item) => handleChange(districtKey, item.value)}
          />
        </View>

        {/* Dropdown for Grade */}
        <View className="w-[20%]">
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
            placeholder={
              values[gradeKey] ? values[gradeKey] : "Select Grade" // Default to "Select Grade" if no value is found
            }
            value={values[gradeKey]}
            onChange={(item) => handleChange(gradeKey, item.value)}
          />
        </View>
      </View>
    );
  };


  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="px-4 mb-2 mt-2 space-y-4">
          <Text className="text-xl text-white font-psemibold">Edit Result</Text>

          <FormField
            title="Item Code"
            value={values.itemcode}
            placeholder={editresult}
            keyboardType={"number-pad"}
            handleChangeText={async (text) => {
              setNewItemCode(Number(text));
              if (text) {
                const programe = await getItemByItemcode(Number(text)).then((res) => {
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

          {renderDropdown("First District", "firstDistrict", "firstGrade")}
          {renderDropdown("Second District", "secondDistrict", "secondGrade")}
          {renderDropdown("Third District", "thirdDistrict", "thirdGrade")}

          <Text className="text-base text-gray-100 font-pmedium mt-10">
            Result Image
          </Text>
          <TouchableOpacity onPress={openPicker}>
            {values.resultimage ? (
              <Image
                source={{ uri: values.resultimage }}
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

          <CustomButton
            title="Update Result"
            handlePress={submit}
            containerStyles="mt-7"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
});

export default EditResult;
