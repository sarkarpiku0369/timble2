import React from 'react';

import {View, Pressable, Image, StyleSheet, Text} from "react-native";
import Entypo from 'react-native-vector-icons/Entypo';
import { COLORS, SIZES, FONTS } from '../constants/StyleConfig';


const Header = (props) => {
    return (
        <View style={styles.header}>
            <View style={styles.leftContainer}>
                {!!props?.rightAction && <Pressable onPress={() => props.rightAction()} ><Entypo name="chevron-back" size={22} color={props?.textColor ?? COLORS.black} /></Pressable>}
                {!!props?.rightLeble && <Pressable onPress={() => props.rightAction()} ><Text style={{fontSize: SIZES.h5, color: props?.textColor ?? COLORS.black}}>{props.rightLeble}</Text></Pressable>}
            </View>
                <View  style={styles.rightContainer}>
                    {!!props?.leftLeble && <Pressable onPress={() => props.leftAction()} ><Text style={{fontSize: SIZES.h5, color: COLORS.black}}>{props.leftLeble}</Text></Pressable>}
                    {!!props?.navigation && <Entypo name="chevron-thin-right" size={22} color={COLORS.black} />}
            </View>
            
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        paddingTop: SIZES.h1,
        // marginHorizontal: 10,
        alignItems: "center",
        justifyContent: "space-between"
    },
    leftContainer:{
        flexDirection: "row",
    },
    rightContainer:{
        flexDirection: "row",
    }
})

export default Header;