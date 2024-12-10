import { Text, TouchableOpacity, View, SafeAreaView, Pressable, TouchableWithoutFeedback, ScrollView, Modal, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import Collapsible from 'react-native-collapsible';
import useAppwrite from '@/lib/useAppwrite';
import { getAllResults, getAllDistrics } from '@/lib/appwrite';
import Animation from '@/components/Animation';

const ScoreBoard = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const { data: latestAllResults } = useAppwrite(getAllResults);
  const { data: districts } = useAppwrite(() => getAllDistrics());
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

  const generalSubcategories = ['G.K', 'G.SJ', 'G.J', 'G.S', 'G.SS', 'G.G'];
  const twalabaSubcategories = ['T.J', 'T.S', 'T.G'];

  const calculateDistrictData = (data) => {
    const districtCategoryMarks = {};
    const totals = {};
    const generalTotals = {};
    const twalabaTotals = {};

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

        if (category?.startsWith('G') && generalSubcategories.includes(category)) {
          districtCategoryMarks[id].general[category] =
            (districtCategoryMarks[id].general[category] || 0) + mark;
        }

        if (category?.startsWith('T') && twalabaSubcategories.includes(category)) {
          districtCategoryMarks[id].twalaba[category] =
            (districtCategoryMarks[id].twalaba[category] || 0) + mark;
        }
      });
    });

    Object.keys(districtCategoryMarks).forEach((districtId) => {
      const generalTotal = Object.values(districtCategoryMarks[districtId].general).reduce((a, b) => a + b, 0);
      const twalabaTotal = Object.values(districtCategoryMarks[districtId].twalaba).reduce((a, b) => a + b, 0);
      const grandTotal = generalTotal + twalabaTotal;

      totals[districtId] = grandTotal;
      generalTotals[districtId] = generalTotal;
      twalabaTotals[districtId] = twalabaTotal;
    });

    return { districtCategoryMarks, totals, generalTotals, twalabaTotals };
  };

  useEffect(() => {
    if (latestAllResults && districts) {
      const { districtCategoryMarks, totals, generalTotals, twalabaTotals } = calculateDistrictData(latestAllResults);
      setDistrictCategoryMarks(districtCategoryMarks);
      setDistrictTotals(totals);
      setGeneralTotals(generalTotals);
      setTwalabaTotals(twalabaTotals);
      setIsLoading(false);
    }
  }, [latestAllResults, districts]);

  const districtMap = districts.reduce((acc, district) => {
    if (district.districtid && district.name) {
      acc[district.districtid] = district.name;
    } else {
      console.warn("Invalid district entry:", district);
    }
    return acc;
  }, {});

  const getRankedData = (data) => {
    const sorted = Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .map(([districtId, total], index, arr) => ({
        districtId,
        total,
        rank: index > 0 && total === arr[index - 1].total ? arr[index - 1].rank : index + 1,
      }));
    return sorted;
  };

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

  const sortedGrandTotal = getRankedData(districtTotals);
  const sortedGeneralTotal = getRankedData(generalTotals);
  const sortedTwalabaTotal = getRankedData(twalabaTotals);

  const toggleCollapse = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
                  {`District: ${content.districtId}\nSubcategory: ${content.subcategory}\nMarks: ${content.marks}`}
                </Text>
                <Text>{districtMap[content.districtId]} </Text>
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl text-white font-psemibold">Leaderboard</Text>

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
                  </View>
                </Collapsible>
              </View>
            )
          })}
          <TouchableOpacity onPress={toggleViewGrandTotal} className="mt-2">
            <Text className="text-green-600">{showAllGrandTotal ? 'View Less' : 'View More'}</Text>
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
                        <Text className="text-xl font-pmedium "> {category}:</Text>
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
                  </View>
                </Collapsible>
              </View>
            )
          })}
          <TouchableOpacity onPress={toggleViewGeneral} className="mt-2">
            <Text className="text-blue-600">{showAllGeneral ? 'View Less' : 'View More'}</Text>
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
                        <Text className="text-xl font-pmedium "> {category}:</Text>
                        <Text className="text-xl font-pmedium "> {districtCategoryMarks[districtId]?.twalaba[category] || 0}</Text>
                      </View>
                    ))}
                  </View>
                </Collapsible>
              </View>
            )
          })}
          <TouchableOpacity onPress={toggleViewTwalaba} className="mt-2">
            <Text className="text-red-600">{showAllTwalaba ? 'View Less' : 'View More'}</Text>
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
