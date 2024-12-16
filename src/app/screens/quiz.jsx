import React, { useCallback, useRef, useMemo, useState, useEffect } from "react";
import { StyleSheet, Image, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { icons, images } from "@/constants";
import { CustomButton, FormField } from "../../components";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import useAppwrite from "@/lib/useAppwrite";
import { checkParticipantExists, getAllQuestions, getCurrentUser, saveQuizResponse, signOut, getSettings } from "@/lib/appwrite";
import QuestionComponent from "@/components/QuestionComponent";
import { debounce } from 'lodash';
import { getAllItems } from '../../utils/AsyncStorage'
import { router } from "expo-router";





const Quiz = () => {

  // hooks
  const [latestQuestions, setLatestQuestions] = useState([])

  const { data: quizstatus } = useAppwrite(() => getSettings("quizstatus"));
  const sheetRef = useRef(null);

  const [clicked, setClicked] = useState(false)
  const [errors, setErrors] = useState({});
  const [registered, setRegistered] = useState(false)
  const [started, setStarted] = useState(false)
  const [onceCompleted, setOnceCompleted] = useState(false)
  const [submitStarted, setSubmitStarted] = useState(false)


  const checkRegistration = async () => {
    const itemss = await getAllItems();
    console.log(itemss, "itemss");
    try {
      const name = await AsyncStorage.getItem('name');
      const mobile = await AsyncStorage.getItem('mobile');
      const place = await AsyncStorage.getItem('place');

      if (mobile, name, place) {
        setRegistered(true);
        setForm({ ...form, name: JSON.parse(name), mobile: mobile, place: JSON.parse(place) });// Pre-fill name if registered
      }
    } catch (error) {
      console.error('Error checking local storage:', error);
    }
  };


  useEffect(() => {
    checkRegistration();


  }, [onceCompleted === true]);

  // variables

  const snapPoints = useMemo(() => ["80%", "90%", "95%"], []);

  // callbacks

  const handleSheetChange = useCallback((index) => {
    console.log("handleSheetChange", index);
  }, []);

  const handleSnapPress = useCallback((index) => {
    sheetRef.current.snapToIndex(index);
  }, []);

  const handleClosePress = useCallback(() => {
    sheetRef.current.close();
  }, []);


  const [form, setForm] = useState({
    name: "",
    mobile: "",
    place: "",
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null,
    q6: null,
    q7: null,
    q8: null,
    q9: null,
    q10: null,
    q11: null,
    q12: null,
    q13: null,
    q14: null,
    q15: null,
    total: null
  });


  const validateForm = () => {
    const newErrors = {};

    if (!form.name) {
      newErrors.name = "Name is required";
    } else if (typeof form.name !== "string") {
      newErrors.name = "Name must be a string";
    }

    if (!form.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(form.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    if (!form.place) {
      newErrors.place = "Place is required";
    } else if (typeof form.place !== "string") {
      newErrors.place = "Place must be a string";
    }

    setErrors(newErrors); // Update errors state based on validation results
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };


  const saveUserData = async () => {

    const status = await checkParticipantExists({ name: form.name, mobile: form.mobile });

    if (status === false) {
      Alert.alert("Message", "You have already successfully participated in this quiz.")
    }

    if (validateForm() && status) {

      setSubmitStarted(true)
      console.log(form);

      const fetchQuestions = async () => {
        const res = await getAllQuestions();
        setLatestQuestions(res)

        await setRegistered(true);
        await setStarted(true)

        return res;
      };

      fetchQuestions()

      const jsonNameValue = JSON.stringify(form.name)
      const jsonPlaceValue = JSON.stringify(form.place)

      await AsyncStorage.setItem('name', jsonNameValue);
      await AsyncStorage.setItem('mobile', form.mobile);
      await AsyncStorage.setItem('place', jsonPlaceValue);
      // await AsyncStorage.removeItem('name');

      const username = await AsyncStorage.getItem('name');
      console.log(username);
      setSubmitStarted(false)
    }

  }



  const handleOptionSelect = async (data) => {


    const [questionNumber, answer] = data.split(',');
    //console.log(questionNumber, answer, "asd");


    await AsyncStorage.setItem(questionNumber, answer);


    // await setForm({
    //   ...form,
    //   [`${questionNumber}`]: Number(answer)

    // });

    // setForm({ ...form, q1: data })

    console.log(`Selected option: ${data}`);

  };




  const submitQuiz = async () => {

    const fetchData = async () => {
      const items = await getAllItems();
      console.log(items, "items");

      let finalTotal = 0;

      for (let i = 1; i <= 15; i++) {
        const questionNumber = `q${i}`;
        if (items[questionNumber] !== undefined && !isNaN(items[questionNumber])) {
          finalTotal += items[questionNumber];
        }
      }

      console.log(finalTotal);

      if (finalTotal >= 0) {
        setForm({ ...form, total: finalTotal });


        try {
          await saveQuizResponse({ name: form.name, mobile: form.mobile, place: form.place, total: finalTotal });


          Alert.alert("Congratulations! ", "You have successfully participated in the quiz.");

          //await AsyncStorage.clear();
          const hasLocalStorageData =
            await AsyncStorage.getItem('q1') !== null ||
            await AsyncStorage.getItem('q2') !== null ||
            await AsyncStorage.getItem('q3') !== null ||
            await AsyncStorage.getItem('q4') !== null ||
            await AsyncStorage.getItem('q5') !== null ||
            await AsyncStorage.getItem('q6') !== null ||
            await AsyncStorage.getItem('q7') !== null ||
            await AsyncStorage.getItem('q8') !== null ||
            await AsyncStorage.getItem('q9') !== null ||
            await AsyncStorage.getItem('q10') !== null ||
            await AsyncStorage.getItem('q11') !== null ||
            await AsyncStorage.getItem('q12') !== null ||
            await AsyncStorage.getItem('q13') !== null ||
            await AsyncStorage.getItem('q14') !== null ||
            await AsyncStorage.getItem('q15') !== null;

          if (hasLocalStorageData) {
            await AsyncStorage.removeItem('q1')
            await AsyncStorage.removeItem('q2')
            await AsyncStorage.removeItem('q3')
            await AsyncStorage.removeItem('q4')
            await AsyncStorage.removeItem('q5')
            await AsyncStorage.removeItem('q6')
            await AsyncStorage.removeItem('q7')
            await AsyncStorage.removeItem('q8')
            await AsyncStorage.removeItem('q9')
            await AsyncStorage.removeItem('q10')
            await AsyncStorage.removeItem('q11')
            await AsyncStorage.removeItem('q12')
            await AsyncStorage.removeItem('q13')
            await AsyncStorage.removeItem('q14')
            await AsyncStorage.removeItem('q15')
          }

          AsyncStorage.removeItem('name');
          AsyncStorage.removeItem('mobile');
          AsyncStorage.removeItem('place');

          await AsyncStorage.setItem('buttonClicked', 'true');

          setForm({ ...form, name: "", mobile: "", place: "" })

          setOnceCompleted(!onceCompleted)
          setClicked(!clicked);
          setStarted(!started);
        } catch (error) {
          Alert.alert("Message", "Something went wrong please try again.");
        }
      } else {

      }
    };

    // Check if any question data exists in local storage before fetching
    const hasLocalStorageData =
      await AsyncStorage.getItem('q1') !== null ||
      await AsyncStorage.getItem('q2') !== null ||
      await AsyncStorage.getItem('q3') !== null ||
      await AsyncStorage.getItem('q4') !== null ||
      await AsyncStorage.getItem('q5') !== null ||
      await AsyncStorage.getItem('q6') !== null ||
      await AsyncStorage.getItem('q7') !== null ||
      await AsyncStorage.getItem('q8') !== null ||
      await AsyncStorage.getItem('q9') !== null ||
      await AsyncStorage.getItem('q10') !== null ||
      await AsyncStorage.getItem('q11') !== null ||
      await AsyncStorage.getItem('q12') !== null ||
      await AsyncStorage.getItem('q13') !== null ||
      await AsyncStorage.getItem('q14') !== null ||
      await AsyncStorage.getItem('q15') !== null;

    if (hasLocalStorageData) {
      fetchData();
    } else {
      Alert.alert("Message", "Please answer at least one question.");
    }
  };
  // render

  return (

    <>

      {clicked === true && started === false ? (
        <GestureHandlerRootView style={styles.container}>

          <BottomSheet
            ref={sheetRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            onChange={handleSheetChange}
          >
            <KeyboardAwareScrollView>
              <BottomSheetView style={styles.contentContainer}>
                <View className="flex  items-end w-full justify-end">
                  <TouchableOpacity
                    onPress={() => {
                      setClicked(!clicked)
                      setStarted(false)
                    }
                    }
                  >
                    <Image
                      source={icons.cancel}
                      className="w-[30px] h-[30px] -mt-10 -mr-5"
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>

                <Text className="text-4xl font-pbold mb-2">Register</Text>

                <FormField
                  title="Name"
                  titleStyles={"text-black"}
                  value={form.name}
                  placeholder="Enter Your Full Name"
                  handleChangeText={(e) => setForm({ ...form, name: e })}
                  otherStyles=""
                  error={errors.name}
                />

                <FormField
                  title="Mobile no:"
                  titleStyles={"text-black"}
                  value={form.mobile}
                  placeholder="Enter Your Mobile No"
                  handleChangeText={(e) => setForm({ ...form, mobile: e })}
                  otherStyles="mt-5"
                  error={errors.mobile}
                  keyboardType={"number-pad"}
                />

                <FormField
                  title="Place"
                  titleStyles={"text-black"}
                  value={form.place}
                  placeholder="Enter Your Place"
                  handleChangeText={(e) => setForm({ ...form, place: e })}
                  otherStyles="mt-5"
                  error={errors.place}
                />


                <CustomButton
                  title={submitStarted ? "Submitting..." : "Start Quiz"}
                  handlePress={saveUserData}
                  // isLoading={uploading}
                  containerStyles={"w-full mt-7 mb-4"}
                />

              </BottomSheetView>
            </KeyboardAwareScrollView>
          </BottomSheet>

        </GestureHandlerRootView>

      ) : clicked === true && started === true ? (
        <GestureHandlerRootView style={styles.container}>
          <BottomSheet
            ref={sheetRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            onChange={handleSheetChange}
          >

            <BottomSheetScrollView contentContainerStyle={styles.contentCContainer}>
              <View className="flex  items-end w-full justify-end ">
                <TouchableOpacity
                  onPress={async () => {

                    Alert.alert(
                      "Confirmation",
                      "Are you sure you want to back?",
                      [
                        {
                          text: "Yes",
                          onPress: async () => {
                            setClicked(!clicked)
                            setStarted(!started)

                            const hasLocalStorageData =
                              await AsyncStorage.getItem('q1') !== null ||
                              await AsyncStorage.getItem('q2') !== null ||
                              await AsyncStorage.getItem('q3') !== null ||
                              await AsyncStorage.getItem('q4') !== null ||
                              await AsyncStorage.getItem('q5') !== null ||
                              await AsyncStorage.getItem('q6') !== null ||
                              await AsyncStorage.getItem('q7') !== null ||
                              await AsyncStorage.getItem('q8') !== null ||
                              await AsyncStorage.getItem('q9') !== null ||
                              await AsyncStorage.getItem('q10') !== null ||
                              await AsyncStorage.getItem('q11') !== null ||
                              await AsyncStorage.getItem('q12') !== null ||
                              await AsyncStorage.getItem('q13') !== null ||
                              await AsyncStorage.getItem('q14') !== null ||
                              await AsyncStorage.getItem('q15') !== null;

                            if (hasLocalStorageData) {
                              await AsyncStorage.removeItem('q1')
                              await AsyncStorage.removeItem('q2')
                              await AsyncStorage.removeItem('q3')
                              await AsyncStorage.removeItem('q4')
                              await AsyncStorage.removeItem('q5')
                              await AsyncStorage.removeItem('q6')
                              await AsyncStorage.removeItem('q7')
                              await AsyncStorage.removeItem('q8')
                              await AsyncStorage.removeItem('q9')
                              await AsyncStorage.removeItem('q10')
                              await AsyncStorage.removeItem('q11')
                              await AsyncStorage.removeItem('q12')
                              await AsyncStorage.removeItem('q13')
                              await AsyncStorage.removeItem('q14')
                              await AsyncStorage.removeItem('q15')
                            }
                          },
                          style: "destructive",
                        },
                        { text: "No", style: "cancel" },
                      ]
                    );

                  }
                  }
                >
                  <Image
                    source={icons.cancel}
                    className="w-[30px] h-[30px] -mt-10 -mr-5"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              <Text className="text-4xl font-pbold mb-2">Questions</Text>
              <Text className="text-sm font-plight mb-2">You have successfully registerd {form.name}!</Text>
              <Text className="text-sm font-plight mb-2">Please answer the following questions</Text>


              <View className="flex flex-col gap-3 w-full">
                {latestQuestions.map((question, index) => {
                  return (
                    <QuestionComponent
                      key={index}
                      questioncode={question.questioncode}
                      index={index}
                      question={question.question}
                      answer={question.answer}
                      optionA={question.optionA}
                      optionB={question.optionB}
                      optionC={question.optionC}
                      optionD={question.optionD}

                      onOptionSelected={handleOptionSelect}
                    />
                  );
                })}
              </View>


              <CustomButton
                title="Submit"
                handlePress={submitQuiz}
                // isLoading={uploading}
                containerStyles={"w-full mt-7 mb-4"}
              />
            </BottomSheetScrollView  >
          </BottomSheet>
        </GestureHandlerRootView>
      ) : (

        <>

          <SafeAreaView className="bg-primary h-full">

            {/* <Loader isLoading={loading} /> */}

            <ScrollView

              contentContainerStyle={{
                height: "100%",
              }}
            >

              <View className="w-full flex justify-center items-center h-full px-4  -mt-2">

                <Image
                  source={images.motolg}
                  className="max-w-[300px] w-full h-[150px] mb-10"
                  resizeMode="contain"

                />


                <Image
                  source={images.sksm}
                  className="w-[166px] h-[20px]  "
                  resizeMode="contain"

                />

                <Text className="text-white mt-2 -mb-1 text-sm"> 15th, State</Text>

                <Image
                  source={images.sargatypog}
                  className="w-[166px] h-[45px]  "
                  resizeMode="contain"
                />


                <Text className="text-lg font-bold font-amedium text-gray-100  text-center">
                  Online Quiz{" "}
                </Text>
                <View className="bg-black-100 rounded-2xl p-4 my-4">
                  <Text className="text-base text-white font-aregular font-amedium  text-center">
                    {">"} അവസാന സമയം ഡിസം: 29 - 10:00AM
                  </Text>
                  <Text className="text-base text-white font-aregular font-amedium   text-center">
                    {">"} തുടർന്ന് വരുന്ന 15 ചോദ്യങ്ങൾക്കാണ് ഉത്തരം നൽകേണ്ടത്.
                  </Text>
                  {/* <Text className="text-base text-white font-aregular font-amedium   text-center">
                > ഒരാൾക്ക് ഒരു പ്രാവിശ്യം മാത്രമേ മത്സരത്തിൽ പങ്കെടുക്കാൻ കഴിയൂ.
                  </Text> */}
                  <Text className="text-sm text-white font-aregular font-amedium text-center">
                    * ഒന്നിൽ കൂടുതൽ വിജയികൾ ഉണ്ടാകുന്ന പക്ഷം നറുക്കെടുപ്പിലൂടെ വിജയിയെ കണ്ടെത്തുന്നതാണ്.
                  </Text>
                </View>


                <TouchableOpacity
                  onPress={() => {
                    if (quizstatus.value === "on") {
                      setClicked(!clicked)
                      checkRegistration();
                    } else {
                      Alert.alert("Message", "Quiz time is over.")
                      router.push("/home")
                    }
                  }}
                >
                  <View className="bg-secondary px-4 py-3 mt-2 mt-10 rounded-[35px]">
                    <Text className="text-xl font-pmedium">Enter to Quiz</Text>
                  </View>

                </TouchableOpacity>

              </View>

            </ScrollView>

            <StatusBar backgroundColor="#161622" style="light" />

          </SafeAreaView>

        </>
      )}
    </>
  );
};



const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingTop: 200,
  },

  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',

  },
  contentCContainer: {
    backgroundColor: "white",
    padding: 36,
  },
});



export default Quiz;