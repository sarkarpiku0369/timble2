import React from 'react';
import { View, TextInput, StyleSheet, Image } from "react-native";
import { COLORS, SIZES, FONTS } from '../constants/StyleConfig';
const CustomInputText = ({fieldName, iconName, placeholderName}) =>{
    return (<View style={styles.inputContainer}>
                    {iconName && <Image style={{ width: 20, height: 20, marginLeft: 15 }} source={require(iconName)} />}
                    <TextInput
                        style={styles.inputText}
                        placeholder="Full Name"
                    />
                </View>)
}

const styles = StyleSheet.create({
    
    inputContainer:{
        backgroundColor: COLORS.white,
        flexDirection: "row",
        borderRadius: 25,
        marginHorizontal: 20,
        elevation: 10,
        marginVertical: 20,
        alignItems: "center",
        height: 50
    },
    inputText : {
        flex: 1
    }

})

export default CustomInputText;