import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
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
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import { useGlobalContext } from "../../context/Globalprovider";

const EditResult = () => {
  const { editresult } = useLocalSearchParams(); // Get the editresult parameter (itemcode or result ID)
  const [programe, setPrograme] = useState("");
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(false);

  const [modalVisibleA, setModalVisibleA] = useState(false);
  const [modalVisibleB, setModalVisibleB] = useState(false);
  const [modalVisibleC, setModalVisibleC] = useState(false);

  const [selectedItemsA, setSelectedItemsA] = useState([]);
  const [selectedItemsB, setSelectedItemsB] = useState([]);
  const [selectedItemsC, setSelectedItemsC] = useState([]);

  // Function to handle item selection for A
  const handleItemSelectA = (item) => {
    const newSelectedItems = [...selectedItemsA];
    const itemId = Number(item.id); // Ensure item.id is a number

    const index = newSelectedItems.indexOf(itemId);

    if (index === -1) {
      newSelectedItems.push(itemId); // Add the ID if not selected
    } else {
      newSelectedItems.splice(index, 1); // Remove the ID if already selected
    }

    setSelectedItemsA(newSelectedItems);
  };

  // Function to handle item selection for B
  const handleItemSelectB = (item) => {
    const newSelectedItems = [...selectedItemsB];
    const itemId = Number(item.id);

    const index = newSelectedItems.indexOf(itemId);

    if (index === -1) {
      newSelectedItems.push(itemId);
    } else {
      newSelectedItems.splice(index, 1);
    }

    setSelectedItemsB(newSelectedItems);
  };

  // Function to handle item selection for C
  const handleItemSelectC = (item) => {
    const newSelectedItems = [...selectedItemsC];
    const itemId = Number(item.id);

    const index = newSelectedItems.indexOf(itemId);

    if (index === -1) {
      newSelectedItems.push(itemId);
    } else {
      newSelectedItems.splice(index, 1);
    }

    setSelectedItemsC(newSelectedItems);
  };

  // Get selected labels for A
  const getSelectedLabelsA = () => {
    return transformedDataforGrades
      .filter(item => selectedItemsA.includes(Number(item.id))) // Ensure item.id is a number
      .map(item => item.name)
      .join(', ');
  };

  // Get selected labels for B
  const getSelectedLabelsB = () => {
    return transformedDataforGrades
      .filter(item => selectedItemsB.includes(Number(item.id)))
      .map(item => item.name)
      .join(', ');
  };

  // Get selected labels for C
  const getSelectedLabelsC = () => {
    return transformedDataforGrades
      .filter(item => selectedItemsC.includes(Number(item.id)))
      .map(item => item.name)
      .join(', ');
  };

  // Functions to open/close modals
  const openModalA = () => setModalVisibleA(true);
  const closeModalA = () => setModalVisibleA(false);

  const openModalB = () => setModalVisibleB(true);
  const closeModalB = () => setModalVisibleB(false);

  const openModalC = () => setModalVisibleC(true);
  const closeModalC = () => setModalVisibleC(false);


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
    gradesonly: {}
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
      console.log(result, "reesess");
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
        gradesonly: result.gradesonly ? JSON.parse(result.gradesonly) : {}

      });
    }
    getprograme()
  }, [result]); useEffect(() => {
    if (result) {
      console.log(result, "reesess");
      const gradesOnlyParsed = result.gradesonly ? JSON.parse(result.gradesonly) : {};

      // Set values, including parsed gradesonly
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
        gradesonly: gradesOnlyParsed,
      });

      // Handle gradesonly-related state updates immediately
      if (gradesOnlyParsed) {
        const { A, B, C } = gradesOnlyParsed;

        setSelectedItemsA(A && A.length > 0 ? [...A] : []); // Populate or reset A
        setSelectedItemsB(B && B.length > 0 ? [...B] : []); // Populate or reset B
        setSelectedItemsC(C && C.length > 0 ? [...C] : []); // Populate or reset C
      }
    }

    getprograme(); // Call the function once result is processed
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
    setLoading(true)
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
      gradesOnly: [`{ "A": [${selectedItemsA}], "B": [${selectedItemsB}], "C": [${selectedItemsC}] }`]
    };

    if (values.resultimagenew) {
      resultObject.resultimage = values.resultimagenew;
    }

    resultObject.itemcode = newItemCode !== 0 ? newItemCode : values.itemcode;


    try {
      setLoading(true)
      console.log(resultObject, "obbbb");
      await updateResult(resultObject);
      setLoading(false)

      Alert.alert("Success", "Result updated successfully");
      router.push("/home");
    } catch (error) {
      console.error(error);
      setLoading(false)

      Alert.alert("Error", "Failed to update result");
    }
  };


  // Transform district data for the dropdown

  const transformedDataforGrades = districts ? districts.map((district) => ({
    id: district.districtid,
    label: `${district.districtid} . ${district.name}`,
    name: district.name,
  })) : [];


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

  const renderDropdown = (label, districtKey, gradeKey) => {


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





          <View style={styles.container} className="mt-4">
            <Text className="text-base text-gray-100 font-pmedium">A Grade only</Text>

            {/* Display selected items for A */}
            <TouchableOpacity style={styles.selectedItemsContainer} onPress={openModalA}>
              <Text style={styles.selectedText}>
                {selectedItemsA.length > 0 ? getSelectedLabelsA() : 'Select Items for A'}
              </Text>
            </TouchableOpacity>

            {/* Modal for A */}
            <Modal
              visible={modalVisibleA}
              animationType="slide"
              transparent={true}
              onRequestClose={closeModalA}
            >
              <TouchableWithoutFeedback onPress={closeModalA}>
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                      <TouchableOpacity style={styles.closeButton} onPress={closeModalA}>
                        <Text style={styles.closeButtonText}>Close</Text>
                      </TouchableOpacity>
                      <FlatList
                        data={transformedDataforGrades}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={[
                              styles.item,
                              selectedItemsA.includes(Number(item.id)) && styles.selectedItem,
                            ]}
                            onPress={() => handleItemSelectA(item)}
                          >
                            <Text style={styles.itemText}>{item.label}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>

            {/* Display selected items for B */}
            <Text className="text-base text-gray-100 font-pmedium">B Grade only</Text>

            <TouchableOpacity style={styles.selectedItemsContainer} onPress={openModalB}>
              <Text style={styles.selectedText}>
                {selectedItemsB.length > 0 ? getSelectedLabelsB() : 'Select Items for B'}
              </Text>
            </TouchableOpacity>

            {/* Modal for B */}
            <Modal
              visible={modalVisibleB}
              animationType="slide"
              transparent={true}
              onRequestClose={closeModalB}
            >
              <TouchableWithoutFeedback onPress={closeModalB}>
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                      <TouchableOpacity style={styles.closeButton} onPress={closeModalB}>
                        <Text style={styles.closeButtonText}>Close</Text>
                      </TouchableOpacity>
                      <FlatList
                        data={transformedDataforGrades}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={[
                              styles.item,
                              selectedItemsB.includes(Number(item.id)) && styles.selectedItem,
                            ]}
                            onPress={() => handleItemSelectB(item)}
                          >
                            <Text style={styles.itemText}>{item.label}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>

            <Text className="text-base text-gray-100 font-pmedium">C Grade only</Text>

            {/* Display selected items for C */}
            <TouchableOpacity style={styles.selectedItemsContainer} onPress={openModalC}>
              <Text style={styles.selectedText}>
                {selectedItemsC.length > 0 ? getSelectedLabelsC() : 'Select Items for C'}
              </Text>
            </TouchableOpacity>

            {/* Modal for C */}
            <Modal
              visible={modalVisibleC}
              animationType="slide"
              transparent={true}
              onRequestClose={closeModalC}
            >
              <TouchableWithoutFeedback onPress={closeModalC}>
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                      <TouchableOpacity style={styles.closeButton} onPress={closeModalC}>
                        <Text style={styles.closeButtonText}>Close</Text>
                      </TouchableOpacity>
                      <FlatList
                        data={transformedDataforGrades}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={[
                              styles.item,
                              selectedItemsC.includes(Number(item.id)) && styles.selectedItem,
                            ]}
                            onPress={() => handleItemSelectC(item)}
                          >
                            <Text style={styles.itemText}>{item.label}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>

          <CustomButton
            title="Update Result"
            handlePress={submit}
            isLoading={loading}
            containerStyles="mt-7"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItemsContainer: {
    backgroundColor: '#f1f1f1',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: '80%',
    borderRadius: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedItem: {
    backgroundColor: 'green',
    color: 'white',
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dropdownOnly: {
    height: 50,
    borderColor: 'gray',
    backgroundColor: "white",
    borderWidth: 0.5,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
});

export default EditResult;
