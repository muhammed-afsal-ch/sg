import { Text, TouchableOpacity, View, SafeAreaView, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import Collapsible from 'react-native-collapsible';
import useAppwrite from '@/lib/useAppwrite';
import { getAllResults, getAllDistrics } from '@/lib/appwrite';
import Animation from '@/components/Animation';

const ScoreBoard = (s) => {
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

  const generalSubcategories = ['G.K', 'G.SJ', 'G.J', 'G.S', 'G.SS', 'G.G'];
  const twalabaSubcategories = ['T.J', 'T.S', 'T.G'];

  function calculateDistrictData(data) {
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
  }

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

  // Updated district map with lowercase `districtid`
  const districtMap = districts.reduce((acc, district) => {
    if (district.districtid && district.name) {  // Changed districtId to districtid (lowercase)
      acc[district.districtid] = district.name;
    } else {
      console.warn("Invalid district entry:", district);
    }
    return acc;
  }, {});


  const sortedGrandTotal = Object.entries(districtTotals).sort(([, a], [, b]) => b - a);
  const sortedGeneralTotal = Object.entries(generalTotals).sort(([, a], [, b]) => b - a);
  const sortedTwalabaTotal = Object.entries(twalabaTotals).sort(([, a], [, b]) => b - a);

  const toggleCollapse = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const toggleViewGrandTotal = () => {
    setShowAllGrandTotal(!showAllGrandTotal);
  };

  const toggleViewGeneral = () => {
    setShowAllGeneral(!showAllGeneral);
  };

  const toggleViewTwalaba = () => {
    setShowAllTwalaba(!showAllTwalaba);
  };

  if (isLoading) {
    return <Animation />;
  }

  return (
    <SafeAreaView className="px-4 my-6 bg-primary h-full">
      <ScrollView>
        <Text className="text-2xl text-white font-psemibold">ScoreBoard</Text>

        {/* Grand Total Section */}
        <View>
          <Text className="text-xl text-white font-semibold">Grand Total</Text>
          {(showAllGrandTotal ? sortedGrandTotal : sortedGrandTotal.slice(0, 3)).map(([districtId, grandTotal], index) => {
            const districtName = districtMap[districtId] || `District ${districtId}`;
            return (
              <View key={`grand-${districtId}`}>
                <TouchableOpacity onPress={() => toggleCollapse(`grand-${index}`)} className="bg-green-600 p-4 rounded my-2">
                  <Text className="text-white">{districtName} - Total: {grandTotal} marks</Text>
                </TouchableOpacity>
                <Collapsible collapsed={openIndex !== `grand-${index}`}>
                  <View className="bg-gray-200 p-2">
                    <Text>General: {generalTotals[districtId] || 0}</Text>
                    <Text>Twalaba: {twalabaTotals[districtId] || 0}</Text>
                  </View>
                </Collapsible>
              </View>
            );
          })}
          <TouchableOpacity onPress={toggleViewGrandTotal} className="mt-2">
            <Text className="text-green-600">{showAllGrandTotal ? 'View Less' : 'View More'}</Text>
          </TouchableOpacity>
        </View>

        {/* General Category Section */}
        <View>
          <Text className="text-xl text-white font-semibold mt-4">General Category</Text>
          {(showAllGeneral ? sortedGeneralTotal : sortedGeneralTotal.slice(0, 3)).map(([districtId, total], index) => {
            const districtName = districtMap[districtId] || `District ${districtId}`;

            return (
              <View key={`general-${districtId}`}>
                <TouchableOpacity onPress={() => toggleCollapse(`general-${index}`)} className="bg-blue-600 p-4 rounded my-2">
                  <Text className="text-white">{districtName} - Total: {total} marks</Text>
                </TouchableOpacity>
                <Collapsible collapsed={openIndex !== `general-${index}`}>
                  <View className="bg-gray-200 p-2">
                    {generalSubcategories.map((category) => (
                      <Text key={category}>{category}: {districtCategoryMarks[districtId]?.general[category] || 0} marks</Text>
                    ))}
                  </View>
                </Collapsible>
              </View>
            );
          })}
          <TouchableOpacity onPress={toggleViewGeneral} className="mt-2">
            <Text className="text-blue-600">{showAllGeneral ? 'View Less' : 'View More'}</Text>
          </TouchableOpacity>
        </View>

        {/* Twalaba Category Section */}
        <View className="mb-10">
          <Text className="text-xl text-white font-semibold mt-4">Twalaba Category</Text>
          {(showAllTwalaba ? sortedTwalabaTotal : sortedTwalabaTotal.slice(0, 3)).map(([districtId, total], index) => {
            const districtName = districtMap[districtId] || `District ${districtId}`;

            return (
              <View key={`twalaba-${districtId}`}>
                <TouchableOpacity onPress={() => toggleCollapse(`twalaba-${index}`)} className="bg-red-600 p-4 rounded my-2">
                  <Text className="text-white">{districtName} - Total: {total} marks</Text>
                </TouchableOpacity>
                <Collapsible collapsed={openIndex !== `twalaba-${index}`}>
                  <View className="bg-gray-200 p-2">
                    {twalabaSubcategories.map((category) => (
                      <Text key={category}>{category}: {districtCategoryMarks[districtId]?.twalaba[category] || 0} marks</Text>
                    ))}
                  </View>
                </Collapsible>
              </View>
            );
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
