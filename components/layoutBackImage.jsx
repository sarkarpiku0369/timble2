import React from "react";
import { ImageBackground, StyleSheet } from "react-native";
const LayoutBackImage = ({ children }) =>{

    return(<ImageBackground style={styles.image} source={require("../assets/images/signin.webp")}>
        {children}
    </ImageBackground>)

}

const styles = StyleSheet.create({
    image: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: "absolute"
    },
})


export default LayoutBackImage;
