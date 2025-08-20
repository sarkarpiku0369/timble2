import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants/StyleConfig';

const CommonDropdown = ({ options }) => {
  const [selectedValue, setSelectedValue] = useState();

  return (
    <View style={styles.selectContainer}>
      {(!!options && options.length > 0) && (
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue) => setSelectedValue(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select..." value={null} />
          {options.map((option, index) => (
            <Picker.Item key={index} label={option.label} value={option.value} />
          ))}
        </Picker>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  selectContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    elevation: 10,
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    color: 'black',
  },
});

export default CommonDropdown;
