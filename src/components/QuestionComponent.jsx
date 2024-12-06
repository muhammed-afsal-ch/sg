import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RadioButton } from 'react-native-paper';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'start',
        flexDirection:"column"
    },
    radioGroup: {
        flexDirection: 'column',
        alignItems: 'start',
        justifyContent: 'space-around',
        marginTop: 20,
        borderRadius: 8,
        backgroundColor: 'white',
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioLabel: {
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
    },
});

const QuestionComponent = ({index,questioncode,answer, question, optionA, optionB, optionC, optionD, onOptionSelected }) => {
    const [selectedValue, setSelectedValue] = useState(null);

    return (
        <View style={styles.container}>
            <View style={styles.radioGroup} className='border border-1 border-gray-100'>
            <Text className='mb-2 text-xl font-bold'> {index+1} . {question}</Text>
                <View style={styles.radioButton}>
                    <RadioButton.Android
                        value="optionA"
                        status={selectedValue === 'optionA' ? 
                                'checked' : 'unchecked'}
                        onPress={() => {
                          setSelectedValue('optionA')
                          onOptionSelected(`q${index+1},${answer==="optionA" ? 1 :0}`)
                        }}
                        color="#007BFF"
                    />
                    <Text style={styles.radioLabel}>
                    {optionA}
                    </Text>
                </View>

                <View style={styles.radioButton}>
                    <RadioButton.Android
                        value="optionB"
                        status={selectedValue === 'optionB' ? 
                                 'checked' : 'unchecked'}
                        onPress={() => {
                          setSelectedValue('optionB')
                          onOptionSelected(`q${index+1},${answer==="optionB" ? 1 :0}`)
                        }}
                        color="#007BFF"
                    />
                    <Text style={styles.radioLabel}>
                    {optionB}
                    </Text>
                </View>

                <View style={styles.radioButton}>
                    <RadioButton.Android
                        value="optionC"
                        status={selectedValue === 'optionC' ? 
                                'checked' : 'unchecked'}
                        onPress={() => {
                          setSelectedValue('optionC')
                          onOptionSelected(`q${index+1},${answer==="optionC" ? 1 :0}`)
                        }}
                        color="#007BFF"
                    />
                    <Text style={styles.radioLabel}>
                    {optionC}
                    </Text>
                </View>

                <View style={styles.radioButton}>
                    <RadioButton.Android
                        value="optionD"
                        status={selectedValue === 'optionD' ? 
                                'checked' : 'unchecked'}
                        onPress={() => {
                          setSelectedValue('optionD')
                          onOptionSelected(`q${index+1},${answer==="optionD" ? 1 :0}`)
                        }}
                        color="#007BFF"
                    />
                    <Text style={styles.radioLabel}>
                    {optionD}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default QuestionComponent;




// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity,RadioButton,   } from 'react-native';

// const QuestionComponent = ({questioncode, question, optionA, optionB, optionC, optionD, onOptionSelected }) => {
//   const [selectedOption, setSelectedOption] = useState(null);

//   const handleOptionSelect = (option) => {
//     setSelectedOption(option);
//     onOptionSelected(`${questioncode}${option}`);
//   };

//   return (
//     <View className='flex flex-col gap-2 bg-gray-100 p-4 w-full rounded-lg'>
//       <Text>{question}</Text>
      
//       <View className="flex flex-row items-center">
//         <RadioButton
//           value="A"
//           status={selectedOption === 'A' ? 'checked' : 'unchecked'}
//           onPress={() => handleOptionSelect('A')}
//         />
//         <Text>{optionA}</Text>
//       </View>

//       <TouchableOpacity onPress={() => onOptionSelected(`${questioncode}A`)}>
//         <Text>{optionA}</Text>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => onOptionSelected(`${questioncode}B`)}>
//         <Text>{optionB}</Text>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => onOptionSelected(`${questioncode}C`)}>
//         <Text>{optionC}</Text>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => onOptionSelected(`${questioncode}D`)}>
//         <Text>{optionD}</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default QuestionComponent;