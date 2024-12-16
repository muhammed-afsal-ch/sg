import { Text, TouchableOpacity, View, Pressable, TouchableWithoutFeedback, RefreshControl, ScrollView, Modal, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from 'react';
import Collapsible from 'react-native-collapsible';
import useAppwrite from '@/lib/useAppwrite';
import { getAllResults, getAllDistrics, getAllPrgrams, getItemByItemcode } from '@/lib/appwrite';
import Animation from '@/components/Animation';
import { DataTable } from 'react-native-paper';


const ScoreBoard = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const { data: latestAllResults, refetch } = useAppwrite(getAllResults);
  const { data: districts } = useAppwrite(() => getAllDistrics());
  const { data: programs } = useAppwrite(() => getAllPrgrams());
  const [districtCategoryMarks, setDistrictCategoryMarks] = useState({});
  const [districtTotals, setDistrictTotals] = useState({});
  const [generalTotals, setGeneralTotals] = useState({});
  const [twalabaTotals, setTwalabaTotals] = useState({});
  const [showAllGrandTotal, setShowAllGrandTotal] = useState(false);
  const [showAllGeneral, setShowAllGeneral] = useState(false);
  const [showAllTwalaba, setShowAllTwalaba] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [gradeMarksDetails, setGradeMarksDetails] = useState({});
  const [refreshing, setRefreshing] = useState(false);



  const getcat = (itemcode, callback) => {
    try {
      getItemByItemcode(itemcode)
        .then((pointCategory) => {
          callback(pointCategory); // Pass the fetched data to the callback
        })
        .catch((error) => {
          console.error("Error fetching point category:", error);
        });
    } catch (error) {
      console.error("Error fetching point category:", error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const getRankClasses = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-green-400 ';
      case 2:
        return 'bg-orange-400 ';
      case 3:
        return 'bg-blue-400 ';
      default:
        return 'bg-gray-300 ';
    }
  };


  const getRankBorderClasses = (rank) => {
    switch (rank) {
      case 1:
        return ' border-green-200';
      case 2:
        return 'border-orange-200';
      case 3:
        return 'border-blue-200';
      default:
        return 'border-gray-200';
    }
  };

  const categoriesName = {
    'G.K': 'General Kiddies',
    'G.SJ': 'General Sub Junior',
    'G.J': 'General Junior',
    'G.S': 'General Senior',
    'G.SS': 'General Super Senior',
    'G.G': 'General Group',
    'T.J': 'Twalaba Junior',
    'T.S': 'Twalaba Senior',
    'T.G': 'Twalaba Group'
  };
  
  const scoreTable = {
    A: { position: { First: 10, Second: 7, Third: 5 }, grade: { A: 5, B: 3, C: 1, 0: 0 } },
    B: { position: { First: 7, Second: 5, Third: 3 }, grade: { A: 5, B: 3, C: 1, 0: 0 } },
    C: { position: { First: 5, Second: 3, Third: 1 }, grade: { A: 5, B: 3, C: 1, 0: 0 } },
    Group: { position: { First: 10, Second: 7, Third: 5 }, grade: { A: 10, B: 8, C: 6, 0: 0 } },
  };

  const generalSubcategories = ['G.K', 'G.SJ', 'G.J', 'G.S', 'G.SS', 'G.G'];
  const twalabaSubcategories = ['T.J', 'T.S', 'T.G'];

  const groupedData = latestAllResults.reduce((acc, item) => {
    const districtIds = [
      { id: item.firstdistrict, mark: item.firstmark, category: item.categorycode, source: 'first', grade: item.firstgrade },
      { id: item.seconddistrict, mark: item.secondmark, category: item.categorycode, source: 'second', grade: item.secondgrade },
      { id: item.thirddistrict, mark: item.thirdmark, category: item.categorycode, source: 'third', grade: item.thirdgrade },
    ];

    districtIds.forEach(districtData => {
      const { id: districtId, mark, category, source, grade } = districtData;

      if (!acc[districtId]) {
        acc[districtId] = {
          categories: {},
        };
      }

      if (!acc[districtId].categories[category]) {
        acc[districtId].categories[category] = [];
      }

      acc[districtId].categories[category].push({
        itemCode: item.itemcode,
        mark,
        source,
        grade,
      });
    });

    return acc;
  }, {});


  for (const districtId in groupedData) {

    for (const category in groupedData[districtId].categories) {

      const items = groupedData[districtId].categories[category];
      items.sort((a, b) => b.mark - a.mark);

      items.forEach((item, index) => {


        // Assign label based on the source of the mark
        item.label = item.source === 'first' ? 'First' : item.source === 'second' ? 'Second' : 'Third';

      });
    }
  }


  const calculateGradeMarksWithDetails = async (data) => {
    const gradeMarksDetails = {};

    const promises = data.map((item) => {
      return new Promise((resolve, reject) => {
        getcat(item.itemcode, (pointCategory) => {
          if (!pointCategory) {
            console.error("Invalid pointCategory:", pointCategory);
            reject("Invalid pointCategory");
            return;
          }

          if (item.gradesonly && item.gradesonly.length) {
            try {
              const gradesOnlyData = JSON.parse(item.gradesonly);

              for (const gradeCategory in gradesOnlyData) {
                const districtIds = gradesOnlyData[gradeCategory];
                const gradePoint = scoreTable[pointCategory.point_category].grade[gradeCategory];

                districtIds.forEach((districtId) => {
                  if (!gradeMarksDetails[districtId]) {
                    gradeMarksDetails[districtId] = {};
                  }

                  const maincategory = "categories"
                  const subcategory = pointCategory.category_code;

                  if (!gradeMarksDetails[districtId][maincategory]) {
                    gradeMarksDetails[districtId][maincategory] = {};
                  }

                  if (!gradeMarksDetails[districtId][maincategory][subcategory]) {
                    gradeMarksDetails[districtId][maincategory][subcategory] = [];
                  }

                  // Push item details instead of summing grade points
                  gradeMarksDetails[districtId][maincategory][subcategory].push({
                    itemcode: item.itemcode,
                    labelname: pointCategory.itemlabel,
                    grademarks: gradePoint,
                  });
                });
              }
              resolve();
            } catch (error) {
              console.error("Error parsing gradesonly:", error);
              reject("Parsing error");
            }
          } else {
            resolve();
          }
        });
      });
    });

    await Promise.all(promises);

    return gradeMarksDetails;
  };


  const calculateGradeMarksOnly = async (data) => {
    const onlyGradeMarks = {};

    const promises = data.map((item) => {
      return new Promise((resolve, reject) => {
        getcat(item.itemcode, (pointCategory) => {
          if (!pointCategory) {
            console.error("Invalid pointCategory:", pointCategory);
            reject("Invalid pointCategory");
            return;
          }

          if (item.gradesonly && item.gradesonly.length) {
            try {
              const gradesOnlyData = JSON.parse(item.gradesonly);

              for (const gradeCategory in gradesOnlyData) {
                const districtIds = gradesOnlyData[gradeCategory];
                const gradePoint = scoreTable[pointCategory.point_category].grade[gradeCategory];

                districtIds.forEach((districtId) => {
                  if (!onlyGradeMarks[districtId]) {
                    onlyGradeMarks[districtId] = {};
                  }

                  const maincategory = pointCategory.category_code.startsWith("G")
                    ? "general"
                    : "twalaba";
                  const subcategory = pointCategory.category_code;

                  if (!onlyGradeMarks[districtId][maincategory]) {
                    onlyGradeMarks[districtId][maincategory] = {};
                  }

                  if (!onlyGradeMarks[districtId][maincategory][subcategory]) {
                    onlyGradeMarks[districtId][maincategory][subcategory] = 0;
                  }
                  onlyGradeMarks[districtId][maincategory][subcategory] += gradePoint;
                });
              }
              resolve();
            } catch (error) {
              console.error("Error parsing gradesonly:", error);
              reject("Parsing error");
            }
          } else {
            resolve();
          }
        });
      });
    });

    await Promise.all(promises);

    //console.log("Final onlyGradeMarks:", onlyGradeMarks);
    return onlyGradeMarks;
  };

  // Function to calculate district data and merge with grade marks
  const calculateDistrictData = async (data) => {
    const districtCategoryMarks = {};
    const totals = {};
    const generalTotals = {};
    const twalabaTotals = {};

    // Call calculateGradeMarksOnly to get the grade data
    const onlyGradeMarks = await calculateGradeMarksOnly(data); // Calling the function here

    // Fetch the grade details
    const gradesWithDetails = await calculateGradeMarksWithDetails(data);
    //console.log("Grades with details:", JSON.stringify(gradesWithDetails, null, 2));

    // Process the district data to accumulate marks
    data.forEach((item) => {
      const districtIds = [
        { id: item.firstdistrict, mark: Number(item.firstmark) || 0, category: item.categorycode },
        { id: item.seconddistrict, mark: Number(item.secondmark) || 0, category: item.categorycode },
        { id: item.thirddistrict, mark: Number(item.thirdmark) || 0, category: item.categorycode },
      ];

      districtIds.forEach(({ id, mark, category }) => {
        if (!districtCategoryMarks[id]) {
          districtCategoryMarks[id] = { general: {}, twalaba: {} };
        }

        if (category?.startsWith("G") && generalSubcategories.includes(category)) {
          districtCategoryMarks[id].general[category] =
            (districtCategoryMarks[id].general[category] || 0) + mark;
        }

        if (category?.startsWith("T") && twalabaSubcategories.includes(category)) {
          districtCategoryMarks[id].twalaba[category] =
            (districtCategoryMarks[id].twalaba[category] || 0) + mark;
        }
      });
    });

    // Ensure all district IDs from both sources (districtCategoryMarks and onlyGradeMarks) are covered
    const allDistrictIds = new Set([
      ...Object.keys(districtCategoryMarks),
      ...Object.keys(onlyGradeMarks),
    ]);

    // Initialize missing districts in districtCategoryMarks
    allDistrictIds.forEach((districtId) => {
      if (!districtCategoryMarks[districtId]) {
        districtCategoryMarks[districtId] = { general: {}, twalaba: {} };
      }
    });

    // Merge grade marks from onlyGradeMarks into districtCategoryMarks
    allDistrictIds.forEach((districtId) => {
      ["general", "twalaba"].forEach((mainCategory) => {
        if (onlyGradeMarks[districtId]?.[mainCategory]) {
          Object.keys(onlyGradeMarks[districtId][mainCategory]).forEach((subcategory) => {
            const gradeMark = onlyGradeMarks[districtId][mainCategory][subcategory];
            districtCategoryMarks[districtId][mainCategory][subcategory] =
              (districtCategoryMarks[districtId][mainCategory][subcategory] || 0) + gradeMark;
          });
        }
      });
    });

    // Calculate the totals for each district
    Object.keys(districtCategoryMarks).forEach((districtId) => {
      const generalTotal = Object.values(districtCategoryMarks[districtId].general).reduce((a, b) => a + b, 0);
      const twalabaTotal = Object.values(districtCategoryMarks[districtId].twalaba).reduce((a, b) => a + b, 0);
      const grandTotal = generalTotal + twalabaTotal;

      totals[districtId] = grandTotal;
      generalTotals[districtId] = generalTotal;
      twalabaTotals[districtId] = twalabaTotal;
    });

    // Return gradesWithDetails along with other data
    return {
      districtCategoryMarks,
      totals,
      generalTotals,
      twalabaTotals,
      gradesWithDetails
    };
  };


  // Example of how to call the function
  const data = [];  // Your input data
  calculateDistrictData(data).then(result => {
    //console.log(result);
  });



  const fetchData = async () => {
    if (latestAllResults && districts) {
      try {
        setIsLoading(true);
        const {
          districtCategoryMarks,
          totals,
          generalTotals,
          twalabaTotals,
          gradesWithDetails
        } = await calculateDistrictData(latestAllResults);

        if (gradesWithDetails) {
          setGradeMarksDetails((prevDetails) => {
            if (JSON.stringify(prevDetails) !== JSON.stringify(gradesWithDetails)) {
              return gradesWithDetails;
            }
            return prevDetails;
          });
        }

        setDistrictCategoryMarks(districtCategoryMarks);
        setDistrictTotals(totals);
        setGeneralTotals(generalTotals);
        setTwalabaTotals(twalabaTotals);
      } catch (error) {
        console.error("Error fetching district data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [latestAllResults, districts]);

  const onRefresh = async () => {
    setRefreshing(true); 
    
    try {
      refetch()
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
       setIsLoading(false)
      setRefreshing(false); 
    }
  };



  // Map the districts to their respective names by districtId
  const districtMap = districts.reduce((acc, district) => {
    if (district.districtid && district.name) {
      acc[district.districtid] = district.name;
    } else {
      console.warn("Invalid district entry:", district);
    }
    return acc;
  }, {});

  // Safe version of getRankedData that ensures data is defined before processing
  const getRankedData = (data) => {
    if (!data) return [];  // Early return if data is undefined or null

    const sorted = Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .map(([districtId, total], index, arr) => ({
        districtId,
        total,
        rank: index > 0 && total === arr[index - 1].total ? arr[index - 1].rank : index + 1,
      }));

    return sorted;
  };

  // Adjust the ranked data based on the showAll flag
  const adjustRankSlice = (rankedData, showAll) => {
    if (showAll) return rankedData;

    let limit = 3;
    for (let i = 0; i < rankedData.length; i++) {
      if (i >= limit) break;
      if (i < rankedData.length - 1 && rankedData[i].rank === rankedData[i + 1].rank) {
        limit++;
      }
    }
    return rankedData.slice(0, limit);
  };

  // Safely get ranked data for district totals, general totals, and twalaba totals
  const sortedGrandTotal = getRankedData(districtTotals);
  const sortedGeneralTotal = getRankedData(generalTotals);
  const sortedTwalabaTotal = getRankedData(twalabaTotals);

  // Toggle collapse functionality
  const toggleCollapse = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Toggle functions for viewing different totals
  const toggleViewGrandTotal = () => setShowAllGrandTotal(!showAllGrandTotal);
  const toggleViewGeneral = () => setShowAllGeneral(!showAllGeneral);
  const toggleViewTwalaba = () => setShowAllTwalaba(!showAllTwalaba);



  if (isLoading) {
    return <Animation />;
  }

  const ModalContent = ({ isVisible, onClose, content }) => {
    if (!content) return null;

    return (
      <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>
                  {`${districtMap[content.districtId]}\nCategory: ${content.subcategory}`}
                </Text>

                <ScrollView horizontal={true}>
                  <DataTable style={{ padding: 15 }}>
                    <DataTable.Header style={{ backgroundColor: "#DCDCDC" }}>
                      <DataTable.Title style={{ width: 150 }}>Item Name</DataTable.Title>
                      <DataTable.Title style={{ paddingLeft: 6 }} >Cat.</DataTable.Title>
                      <DataTable.Title style={{ paddingLeft: 6 }}>Point</DataTable.Title>
                      <DataTable.Title style={{ paddingLeft: 6 }}>T</DataTable.Title>
                    </DataTable.Header>

                    {/* Check if both groupedData and gradeMarksDetails are empty */}
                    {(
                      (!groupedData[content.districtId]?.categories?.[content.subcategory]?.length) &&
                      (!gradeMarksDetails[content.districtId]?.categories?.[content.subcategory]?.length)
                    ) ? (
                      <DataTable.Row>
                        <DataTable.Cell colSpan={4}>No data found</DataTable.Cell>
                      </DataTable.Row>
                    ) : (
                      <>
                        {/* Display data from groupedData */}
                        {groupedData[content.districtId] &&
                          groupedData[content.districtId].categories &&
                          groupedData[content.districtId].categories[content.subcategory] &&
                          groupedData[content.districtId].categories[content.subcategory].length > 0 ? (
                          groupedData[content.districtId].categories[content.subcategory].map((item, index) => (
                            <DataTable.Row
                              key={`grouped-${index}`}
                              style={{
                                backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
                              }}
                            >
                              <DataTable.Cell style={{ width: 150 }}>
                                {programs[item.itemCode]?.itemlabel || "Unknown"}
                              </DataTable.Cell>
                              <DataTable.Cell >
                                {programs[item.itemCode]?.category_code || "Unknown"}
                              </DataTable.Cell>
                              <DataTable.Cell style={{ paddingLeft: 6 }}>
                                {scoreTable[programs[item.itemCode]?.point_category]?.grade[item.grade]} + {item.mark - scoreTable[programs[item.itemCode]?.point_category]?.grade[item.grade]}
                              </DataTable.Cell>
                              <DataTable.Cell style={{ paddingLeft: 6 }} className='bg-red-100'> | {item.mark}</DataTable.Cell>
                            </DataTable.Row>
                          ))
                        ) : (
                          <>
                          </>
                        )}

                        {/* Display data from gradeMarksDetails */}
                        {gradeMarksDetails[content.districtId] &&
                          gradeMarksDetails[content.districtId].categories &&
                          gradeMarksDetails[content.districtId].categories[content.subcategory] &&
                          gradeMarksDetails[content.districtId].categories[content.subcategory].length > 0 ? (
                          gradeMarksDetails[content.districtId].categories[content.subcategory].map((item, index) => (
                            <DataTable.Row
                              key={`grades-${index}`}
                              style={{
                                backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
                              }}
                            >
                              <DataTable.Cell style={{ width: 150 }}>
                                {programs[item.itemcode]?.itemlabel || "Unknown"}
                              </DataTable.Cell>
                              <DataTable.Cell >
                                {programs[item.itemcode]?.category_code || "Unknown"}
                              </DataTable.Cell>
                              <DataTable.Cell style={{ paddingLeft: 6 }}>0 + {item.grademarks}
                              </DataTable.Cell>
                              <DataTable.Cell style={{ paddingLeft: 6 }} className='bg-red-100'> | {item.grademarks}</DataTable.Cell>
                            </DataTable.Row>
                          ))
                        ) : (
                          <>
                          </>
                        )}
                      </>
                    )}

                  </DataTable>
                </ScrollView>


                <Text style={styles.modalText} className='mt-6'>
                  {`Total Point : `}
                  <Text className='text-red-400 font-semibold text-2xl'>{content.marks}</Text>
                </Text>

                <Pressable style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.buttonText}>Close</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>


    );
  };

  const handleSubcategoryClick = (districtId, subcategory) => {
    const marks = districtCategoryMarks[districtId]?.[subcategory.startsWith('G') ? 'general' : 'twalaba'][subcategory] || 0;
    setModalContent({ districtId, subcategory, marks });
    setModalVisible(true);
  };

  return (
    <SafeAreaView className="px-4 my-6 bg-primary h-full">
      <Text className="text-2xl text-white font-psemibold mb-4  ">Leaderboard</Text>

      <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* Grand Total Section */}
        <View>
          <Text className="text-xl text-white font-semibold">General Ultimate</Text>
          {adjustRankSlice(sortedGrandTotal, showAllGrandTotal).map(({ districtId, total, rank }) => {
            const rankClasses = getRankClasses(rank);
            const rankborderClasses = getRankBorderClasses(rank);

            return (
              <View key={`grand-${districtId}`}>
                <TouchableOpacity onPress={() => toggleCollapse(`grand-${districtId}`)} >
                  <View className="bg-black-100  p-2 rounded-lg my-2 flex flex-row gap-2 items-center">
                    <View className={`p-1 border rounded-full ${rankborderClasses}`}>
                      <View className={` w-16 h-16 text-center rounded-full  flex items-center justify-center ${rankClasses} `}>
                        <Text style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)' }} className="text-gray-800 text-center text-2xl font-pbold">{rank}</Text>
                      </View>
                    </View>
                    <Text className="text-white text-2xl font-psemibold "> {districtMap[districtId]} </Text>
                    <View>
                      <Text className="text-white font-pbold  text-4xl "> {total}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <Collapsible collapsed={openIndex !== `grand-${districtId}`}>
                  <View className="bg-gray-200 p-2 rounded-md">
                    <View className="flex flex-row items-center  p-4 justify-between px-6 border-b border-1 border-gray-100">
                      <Text className="text-xl font-pmedium "> General:</Text>
                      <Text className="text-xl font-pmedium "> {generalTotals[districtId] || 0}</Text>
                    </View>
                    <View className="flex flex-row items-center p-4  justify-between px-6">
                      <Text className="text-xl font-pmedium "> Twalaba:</Text>
                      <Text className="text-xl font-pmedium "> {twalabaTotals[districtId] || 0}</Text>
                    </View>
                    <View className=' px-6 border-t border-1 border-gray-100 '>
                      <Text style={styles.modalText} className='mt-4'>
                        {`Total Point : `}
                        <Text className='text-red-400 font-semibold text-2xl'>{total}</Text>
                      </Text>
                    </View>
                  </View>
                </Collapsible>
              </View>
            )
          })}
          <TouchableOpacity onPress={toggleViewGrandTotal} className="mt-2">
            <Text className="text-gray-100">{showAllGrandTotal ? 'View Less' : 'View More'}</Text>
          </TouchableOpacity>
        </View>

        <ModalContent
          isVisible={modalVisible}
          onClose={closeModal}
          content={modalContent}
        />

        {/* General Category Section */}
        <View>
          <Text className="text-xl text-white font-semibold mt-4">General Dominant</Text>
          {adjustRankSlice(sortedGeneralTotal, showAllGeneral).map(({ districtId, total, rank }) => {
            const rankClasses = getRankClasses(rank);
            const rankborderClasses = getRankBorderClasses(rank);

            return (
              <View key={`general-${districtId}`}>
                <TouchableOpacity onPress={() => toggleCollapse(`general-${districtId}`)}>

                  <View className="bg-black-100  p-2 rounded-lg my-2 flex flex-row gap-2 items-center">
                    <View className={`p-1 border rounded-full ${rankborderClasses}`}>
                      <View className={` w-16 h-16 text-center rounded-full  flex items-center justify-center ${rankClasses} `}>
                        <Text style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)' }} className="text-gray-800 text-center text-2xl font-pbold">{rank}</Text>
                      </View>
                    </View>
                    <Text className="text-white text-2xl font-psemibold "> {districtMap[districtId]} </Text>
                    <View>
                      <Text className="text-white font-pbold  text-4xl "> {total}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <Collapsible collapsed={openIndex !== `general-${districtId}`}>
                  <View className="bg-gray-200 p-2 rounded-md">
                    {generalSubcategories.map((category) => (
                      <View key={category} className="flex flex-row items-center  p-4 justify-between px-6 border-b border-1 border-gray-100">
                        <Text className="text-xl font-pmedium ">  {categoriesName[category]}:</Text>
                        <TouchableOpacity
                          key={category}
                          onPress={() => {
                            handleSubcategoryClick(districtId, category)
                            setModalVisible(true)
                          }}
                        >
                          <Text className="text-xl font-pmedium "> {districtCategoryMarks[districtId]?.general[category] || 0}</Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                    <View className=' px-6 border-t border-1 border-gray-100 '>
                      <Text style={styles.modalText} className='mt-4'>
                        {`Total Point : `}
                        <Text className='text-red-400 font-semibold text-2xl'>{total}</Text>
                      </Text>
                    </View>
                  </View>
                </Collapsible>
              </View>
            )
          })}
          <TouchableOpacity onPress={toggleViewGeneral} className="mt-2">
            <Text className="text-gray-100">{showAllGeneral ? 'View Less' : 'View More'}</Text>
          </TouchableOpacity>
        </View>

        {/* Twalaba Category Section */}
        <View className="mb-10">
          <Text className="text-xl text-white font-semibold mt-4">Twalaba Category</Text>
          {adjustRankSlice(sortedTwalabaTotal, showAllTwalaba).map(({ districtId, total, rank }) => {
            const rankClasses = getRankClasses(rank);
            const rankborderClasses = getRankBorderClasses(rank);
            return (
              <View key={`twalaba-${districtId}`}>
                <TouchableOpacity onPress={() => toggleCollapse(`twalaba-${districtId}`)} >
                  <View className="bg-black-100  p-2 rounded-lg my-2 flex flex-row gap-2 items-center">
                    <View className={`p-1 border rounded-full ${rankborderClasses}`}>
                      <View className={` w-16 h-16 text-center rounded-full  flex items-center justify-center ${rankClasses} `}>
                        <Text style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)' }} className="text-gray-800 text-center text-2xl font-pbold">{rank}</Text>
                      </View>
                    </View>
                    <Text className="text-white text-2xl font-psemibold "> {districtMap[districtId]} </Text>
                    <View>
                      <Text className="text-white font-pbold  text-4xl "> {total}</Text>
                    </View>
                  </View>

                </TouchableOpacity>
                <Collapsible collapsed={openIndex !== `twalaba-${districtId}`}>
                  <View className="bg-gray-200 p-2 rounded-md">
                    {twalabaSubcategories.map((category) => (
                      <View key={category} className="flex flex-row items-center  p-4 justify-between px-6 border-b border-1 border-gray-100">
                        <Text className="text-xl font-pmedium ">  {categoriesName[category]}:</Text>
                        <TouchableOpacity
                          key={category}
                          onPress={() => {
                            handleSubcategoryClick(districtId, category)
                            setModalVisible(true)
                          }}
                        >
                          <Text className="text-xl font-pmedium "> {districtCategoryMarks[districtId]?.twalaba[category] || 0}</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    <View className=' px-6 border-t border-1 border-gray-100 '>
                      <Text style={styles.modalText} className='mt-4'>
                        {`Total Point : `}
                        <Text className='text-red-400 font-semibold text-2xl'>{total}</Text>
                      </Text>
                    </View>
                  </View>
                </Collapsible>
              </View>
            )
          })}
          <TouchableOpacity onPress={toggleViewTwalaba} className="mt-2">
            <Text className="text-gray-100">{showAllTwalaba ? 'View Less' : 'View More'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScoreBoard;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  openButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  closeButton: {
    backgroundColor: "#dc3545",
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
});