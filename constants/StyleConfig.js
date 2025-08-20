import { Dimensions } from "react-native";
const { height, width } = Dimensions.get("screen");

export const COLORS = {
    primary: "#F93CA6",
    secondary: "#F93CA6",

    black: "#000000",
    white: "#ffffff",

    cyan: "#33A29B",
    blue: "#0A4AA2",
    cilver: "#CECCCC",
    gray: "#979292",
    gray1: "#6A6A6A",
    yellow: "#FFCA30",
    red: "#EE1010",
    green: "#75D10C",
    pink: "#F93CA6"
}

export const SIZES = {
    // global size
    base: 8,
    front: 14,
    radius: 12,
    padding: 10,
    padding2: 12,
    margin: 10,
    margin2: 12,

    large: 50,
    h1: 30,
    h2: 22,
    h3: 20,
    h4: 18,
    h5: 16,
    h6: 14,
    body1: 30,
    body2: 20,
    body3: 16,
    body4: 14,
    body5: 12,

    width,
    height
};

export const FONTS = {
    large: { fontSize: SIZES.large },
    h1: { fontSize: SIZES.h1 },
    h2: { fontSize: SIZES.h2, color: COLORS.cyan },
    h3: { fontSize: SIZES.h3 },
    h4: { fontSize: SIZES.h4 },
    h5: { fontSize: SIZES.h5 },
    h6: { fontSize: SIZES.h6 },
    body1: { fontSize: SIZES.body1 },
    body2: { fontSize: SIZES.body2 },
    body3: { fontSize: SIZES.body3 },
    body4: { fontSize: SIZES.body4 },
    body5: { fontSize: SIZES.body5 }
}

const appTheme = {COLORS, SIZES, FONTS};

export default appTheme;
