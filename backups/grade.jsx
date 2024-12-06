import React, { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native'; // Importing Button
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import useAppwrite from '@/lib/useAppwrite';
import { getAllDistrics } from '@/lib/appwrite';

const data = [
  { label: 'Item 1', value: '1' },
  { label: 'Item 2', value: '2' },
  { label: 'Item 3', value: '3' },
  { label: 'Item 4', value: '4' },
  { label: 'Item 5', value: '5' },
  { label: 'Item 6', value: '6' },
  { label: 'Item 7', value: '7' },
  { label: 'Item 8', value: '8' },
];

const DropdownComponent = () => {
  
  const { data: districts } = useAppwrite(() => getAllDistrics());
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

  const [value1, setValue1] = useState(null); // First dropdown value
  const [value2, setValue2] = useState(null); // Second dropdown value
  const [isFocus1, setIsFocus1] = useState(false); // Focus state for the first dropdown
  const [isFocus2, setIsFocus2] = useState(false); // Focus state for the second dropdown


  const handleButtonClick = () => {
    setValue1(null); // Set the first dropdown to Item 7
    setValue2(null); // Set the second dropdown to Item 7
    setIsFocus1(false); // Optionally close the first dropdown
    setIsFocus2(false); // Optionally close the second dropdown
  };

  const handleDropdownChange1 = (item) => {
    setValue1(item.value);
    console.log('Selected value from Dropdown 1:', item.value);
    setIsFocus1(false);
  };

  const handleDropdownChange2 = (item) => {
    setValue2(item.value);
    console.log('Selected value from Dropdown 2:', item.value);
    setIsFocus2(false);
  };

  return (
    <>
     <View className='bg-primary flex flex-row mt-7 mt-1 w-full'>
     <View className='w-[280px] mr-2 '>

     <Text className="text-base text-gray-100 font-pmedium">
      First District
    </Text>

      <Dropdown
        style={[styles.dropdown, isFocus1 && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        data={transformedData}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus1 ? 'Select First District' : 'Select First District'}
        searchPlaceholder="Search..."
        value={value1}
        onFocus={() => setIsFocus1(true)}
        onBlur={() => setIsFocus1(false)}
        onChange={handleDropdownChange1}
       
      />
      
 </View>
  <View className='w-[70px]'>
      <Text className="text-base text-gray-100 font-pmedium">
        Grade
      </Text>
      <Dropdown
        style={[styles.dropdown, isFocus2 && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        data={grades}
        search={false}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus2 ? 'G' : 'G'}
        searchPlaceholder="Search..."
        value={value2}
        onFocus={() => setIsFocus2(true)}
        onBlur={() => setIsFocus2(false)}
        onChange={handleDropdownChange2}

      />
  </View>
        
     </View>
     <Button title="Select Item 7 in Both Dropdowns" onPress={handleButtonClick} />

    </>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    backgroundColor:"white",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16, // Space between the dropdowns
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
  },
});

