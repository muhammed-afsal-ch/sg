import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';

const CustomDropdown = () => {
  // State for modal visibility
  const [modalVisible, setModalVisible] = useState(false);

  // State for selected items
  const [selectedItems, setSelectedItems] = useState([]);

  // Sample list of items (could be fetched from an API)
  const items = [
    { id: 1, label: 'Item 1' },
    { id: 2, label: 'Item 2' },
    { id: 3, label: 'Item 3' },
    { id: 4, label: 'Item 4' },
    { id: 5, label: 'Item 5' }
  ];

  // Function to handle item selection
  const handleItemSelect = (item) => {
    const newSelectedItems = [...selectedItems];
    const index = newSelectedItems.findIndex(selectedItem => selectedItem.id === item.id);
    
    if (index === -1) {
      // If item is not selected, add to array
      newSelectedItems.push(item);
    } else {
      // If item is already selected, remove it from array
      newSelectedItems.splice(index, 1);
    }

    setSelectedItems(newSelectedItems);
  };

  // Function to open the modal
  const openModal = () => {
    setModalVisible(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Display selected items */}
      <TouchableOpacity style={styles.selectedItemsContainer} onPress={openModal}>
        <Text style={styles.selectedText}>
          {selectedItems.length > 0
            ? selectedItems.map(item => item.label).join(', ')
            : 'Select Items'}
        </Text>
      </TouchableOpacity>

      {/* Modal with item list */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
                <FlatList
                  data={items}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.item,
                        selectedItems.some(selectedItem => selectedItem.id === item.id) && styles.selectedItem
                      ]}
                      onPress={() => handleItemSelect(item)}
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
});

export default CustomDropdown;
