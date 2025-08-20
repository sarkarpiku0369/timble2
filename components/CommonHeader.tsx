import { View, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { COLORS } from "../constants/StyleConfig";
import Icon from "react-native-vector-icons/Ionicons";
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

const CommonHeader = ({ search, setSearchPerson,searchPerson }: any) => {
  const [enable, setEnable] = useState(false);

  return (
    <View style={styles.header}>
      <Image
        source={require('../assets/images/timble_logo_label.png')}
        style={styles.logo_timble}
      />

      {/* Show search icon when search is enabled but not active */}
      {search && !enable && (
        <TouchableOpacity onPress={() => setEnable(true)} style={styles.search}>
          <Icon
            name="search"
            size={24}
            color={COLORS.secondary}
          />
        </TouchableOpacity>
      )}

      {/* Show input when search is active */}
      {enable && search && (
        <View style={styles.FlexDirection}>
          <TextInput
          value={searchPerson}
            onChangeText={text => setSearchPerson(text)}
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={() => setEnable(false)} style={styles.search}>
            <Icon
              name="close"
              size={24}
              color={COLORS.secondary}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default CommonHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    paddingVertical: 10
  },
  searchInput: {
    width: wp('60%'),
    borderColor: '#F93CA6',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 15,
  },
  FlexDirection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo_timble: {
    width: 76,
    height: 51,
  },
  search: {
    marginHorizontal: wp('3%'),
    marginVertical: wp('4%')
  },
  horizontalScrollContainer: {
    marginHorizontal: wp('2%'),
  },
});
