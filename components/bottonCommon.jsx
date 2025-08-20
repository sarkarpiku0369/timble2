import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SIZES, FONTS } from '../constants/StyleConfig'
import {widthPercentageToDP as wp, heightPercentageToDP as hp,} from 'react-native-responsive-screen';

const BottonCommon = (props) => {
    return (
        <TouchableOpacity onPress={() => props.handleSubmit()} style={[styles.registerBotton, {backgroundColor: props.bgColor? props.bgColor : COLORS.white}]}>
            <Text style={[styles.bottonText,{color: props.textColor?props.textColor: COLORS.black}]} >{props.label?props.label: null }</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    registerBotton: {
        // paddingVertical: SIZES.base,
        // flexDirection: "row",
        // justifyContent: 'center',
        // alignItems: 'center',
        // backgroundColor: COLORS.white,
        // marginHorizontal: SIZES.width * .20,
        // borderRadius: 20,

        // backgroundColor: COLORS.white,
        // borderRadius: 25,
        // marginHorizontal: 50,
        // elevation: 10,
        // marginVertical: 20,
        // alignItems: "center",
        // height: 50,
        // justifyContent: "center",
width: wp('48%'),
         backgroundColor: COLORS.secondary,
     paddingVertical: hp('1.4%'),
        borderRadius: 30,
        marginVertical: SIZES.h5,
        alignItems: 'center',
        alignSelf: 'center',
        paddingHorizontal: 40,
        fontWeight: '600',

    },
    bottonText: {
        fontSize: wp('4.5%'),
        color: COLORS.black,
        fontWeight: '600',
    }
})

export default BottonCommon;