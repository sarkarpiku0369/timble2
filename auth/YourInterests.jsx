import { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import LayoutBackImage from "../components/layoutBackImage";
import {widthPercentageToDP as wp, heightPercentageToDP as hp,} from 'react-native-responsive-screen';
import { SIZES, FONTS, COLORS } from "../constants/StyleConfig";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BottonCommon from '../components/bottonCommon';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import API_ENDPOINTS from "../apiConfig";
import { GlobalToast } from "../utils/GlobalToast";

const YourInterests = ({ navigation }) => {
    const [token, setUsertoken] = useState('');
    const [fields, setFields] = useState([]);  // To hold dynamic data from API
    const [expandedCategories, setExpandedCategories] = useState({});
    const [selectedItems, setSelectedItems] = useState([]);  // State to track selected items
    const [selectedInterestMap, setSelectedInterestMap] = useState({});

    // Fetch the user data and token from AsyncStorage
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const stored = await AsyncStorage.getItem('userData');
                if (stored) {
                    const user = JSON.parse(stored);
                    setUsertoken(user.token || ''); // Set token
                    // set other user details if needed (e.g., setUsername, setFullname)
                }
            } catch (e) {
                console.error("Failed to load user data", e);
            }
        };
        loadUserData();
    }, []);  // This useEffect runs once when the component mounts

    // Fetch data from API with GET method and token in headers
    useEffect(() => {
        const fetchInterestsData = async () => {
            if (!token) {
                // Alert.alert("Authentication Error", "No token found. Please login again.");
                GlobalToast.showError("Authentication Error","No token found. Please login again.");
                return;
            }
            try {
                const response = await fetch(API_ENDPOINTS.GET_INTERESTS_DETAILS, {
                    method: "GET", // Using GET method
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`, // Add token in the header
                    },
                });

                const data = await response.json();
                if (data.success) {
                    setFields(data.data);  // Set the data returned by API
                } else {
                    // Alert.alert("Error", "Failed to fetch interests data.");
                      GlobalToast.showError("Error","Failed to fetch interests data.");
                }
            } catch (error) {
                console.error(error);
                // Alert.alert("Error", "Something went wrong.");
                 GlobalToast.showError("Error","Something went wrong.");
            }
        };

        if (token) {
            fetchInterestsData();  // Fetch data only when token is available
        }
    }, [token]);  // This useEffect runs whenever token changes

    // Toggle the Show More functionality for each category
    const handleToggleShowMore = (category) => {
        setExpandedCategories(prevState => ({
            ...prevState,
            [category]: !prevState[category]
        }));
    };

    const handleChange = (categoryName, i) => {
    const updatedFields = [...fields];
    const category = updatedFields.find(item => item.name === categoryName);
    const detail = category.details[i];
    detail.checkStatus = !detail.checkStatus;

    const categoryId = category.id;
    const detailId = detail.id;

    setSelectedInterestMap(prev => {
        const current = prev[categoryId] || [];
        const updated = detail.checkStatus
            ? [...current, detailId]
            : current.filter(id => id !== detailId);

        const result = {
            ...prev,
            [categoryId]: updated
        };
        if (result[categoryId].length === 0) {
            delete result[categoryId];
        }
        //AsyncStorage.setItem('selectedInterestMap', JSON.stringify(result)); // optional save
        return result;
    });

    setFields(updatedFields); // update local check status
};

const handleSaveInterests = async () => {
   console.log('selectedInterestMap',selectedInterestMap);
  try {
    const stored = await AsyncStorage.getItem('userData');
    const user = JSON.parse(stored || '{}');
    const token = user.token || '';
    const response = await fetch('https://webtechnomind.in/project/timble/api/store-user-interests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    //   body: JSON.stringify({
    //     interests_data: selectedInterestMap
    //   }),
    body: JSON.stringify({
          interests_data: JSON.stringify(selectedInterestMap),
      }),
    });

    const json = await response.json();
    if (response.ok && json.success) {
    //   Alert.alert('Success', 'Interests saved successfully.');
    GlobalToast.showSuccess("Interests saved successfully.");
       navigation.navigate('Preferences'); // or next screen
    } else {
    //   Alert.alert('Error', json.message || 'Something went wrong.');
      GlobalToast.showError('Error', json.message ||"Something went wrong.");
    }
  } catch (err) {
    console.error('Save error:', err);
    // Alert.alert('Error', 'Unable to save interests.');
GlobalToast.showError('Error',"Unable to save interests.");
  }
};
    return (
        <LayoutBackImage>
            {/* Fixed Header */}
            <View style={{ height: SIZES.height * .25 }} />
            <View style={styles.interestsContainer}>
                <Text style={{ ...FONTS.h1, fontWeight: 'bold' }}>Your </Text>
                <Text style={{ ...FONTS.h1, fontWeight: 'bold' }}>Interests </Text>
            </View>

            {/* Scrollable Card Sections */}
            <ScrollView style={styles.scrollContainer}>
                {fields.map((category, index) => {
                    const isExpanded = expandedCategories[category.name];
                    return (
                        <View style={styles.cardContainer} key={index}>
                            <View style={styles.levelContainer}>
                                <Text style={styles.levelText}>{category.name}</Text>
                            </View>
                            <View style={styles.cardBlock}>
                                <View style={styles.gridContainer}>
                                    {category.details.slice(0, isExpanded ? category.details.length : 4).map((v, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={[styles.itemContainer, v.checkStatus && { backgroundColor: COLORS.secondary }]}
                                            onPress={() => handleChange(category.name, i)}
                                        >
                                            <Text style={[styles.itemText, v.checkStatus && { color: COLORS.white }]}>
  {v.title.length > 7 ? `${v.title.substring(0, 7)}...` : v.title}
</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={styles.showMoreContainer}>
                                    <View style={styles.line}></View>
                                    <TouchableOpacity style={styles.flexLine} onPress={() => handleToggleShowMore(category.name)}>
                                        <Text>Show More</Text>
                                        <FontAwesome style={{ marginHorizontal: 5 }} name="caret-down" size={20} color={COLORS.black} />
                                    </TouchableOpacity>
                                    <View style={styles.line}></View>
                                </View>
                            </View>
                        </View>
                    );
                })}

                 <BottonCommon
    handleSubmit={handleSaveInterests}
    label="Continue"
/>
            </ScrollView>

            {/* Fixed Button */}
            {/* <BottonCommon
                handleSubmit={() => navigation.navigate('Preferences')}
                label="Continue"
            /> */}
           

        </LayoutBackImage>
    );
};

const styles = StyleSheet.create({
    interestsContainer: {
        marginLeft: 20,
        marginTop:40
    },
    scrollContainer: {
        flex: 1, // Takes available space between header and button
        marginBottom: 20 // Space for button
    },
    cardContainer: {
        marginHorizontal: 20,
        marginVertical: 5
    },
    levelContainer: {
        marginVertical: 10
    },
    levelText: {
        ...FONTS.h5,
        fontWeight: 'bold'
    },
    flexLine: {
     flexDirection: 'row',
     marginBottom: 2

    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: 'flex-start',
        gap: 5
    },
    itemContainer: {
        backgroundColor: COLORS.white,
        height: 36,
        width: SIZES.width * .25,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        marginVertical: 1
    },
    itemText: {
     fontSize: wp("4%"),
     fontWeight: 'bold'
    },
    showMoreContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.black,
        marginHorizontal: 10
    },
    cardBlock: {
        backgroundColor: COLORS.yellow,
        borderRadius: 12,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 6,
        padding: 12
    }
});

export default YourInterests;
