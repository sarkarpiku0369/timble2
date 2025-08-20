import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES } from "../constants/StyleConfig";
import API_ENDPOINTS from "../apiConfig";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import CommonHeader from "../components/CommonHeader";

const ChatScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setUsertoken] = useState('');
   const [searchPerson, setSearchPerson] = useState('');

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
        setSearchPerson('')
    }, []);  // This useEffect runs once when the component mounts





    useEffect(() => {
        const fetchUsers = async () => {
            if (!token) {
                Alert.alert("Authentication Error", "No token found. Please login again.");
                return;
            }
            try {
                const response = await fetch(API_ENDPOINTS.GET_USER_LIST, {
                    method: "GET", // Using GET method
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`, // Add token in the header
                    },
                });

                const data = await response.json();
                if (data.success) {
                    //setFields(data.data);  // Set the data returned by API
                    setUsers(data.data);
                    setLoading(false);
                } else {
                    Alert.alert("Error", "Failed to fetch interests data.");
                }
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "Something went wrong.");
            }
        };

        if (token) {
            fetchUsers();  // Fetch data only when token is available
        }
    }, [token]);



  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <CommonHeader search={true} setSearchPerson={setSearchPerson} searchPerson={searchPerson} />
      {/* <View style={styles.header}>
        <Image
          source={require("../assets/images/timble_logo_label.png")}
          style={styles.logo_timble}
        />
        <TouchableOpacity style={styles.search}>
          <Icon
            name="search"
            size={24}
            color={COLORS.secondary}
           
          />
        </TouchableOpacity>
      </View> */}

      {/* Matches */}
      <View style={{backgroundColor: '#fff'}}>
      <View style={styles.horizontalScrollContainer}>
        <Text style={styles.newMatchesText}>New Matches {searchPerson}</Text>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.scrollHorizontal}
        >
          {users.map((user) => (
            <View key={user.id} style={styles.box}>
              <Image
                source={{ uri: user.image }}
                style={styles.avatar}
                resizeMode="cover"
              />
              <Text style={styles.text}>{user.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
      </View>

      {/* Messages */}
     
      <View style={styles.scrollVerticalContainer}>
        <View style={styles.flexDirectionRow}>
          <Text style={styles.newMatchesText}>
            Messages 
          </Text>
            <View style={styles.yellowCircleContainer}>
              <Text style={styles.yellowCircleText}>5</Text>
            </View>
        </View>
       
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.pink} />
        ) : (
          <ScrollView style={styles.scrollVertical}>
          {users
  .filter(user => {
    if (!searchPerson) return true; // show all when search is empty
    return user.name.toLowerCase().includes(searchPerson.toLowerCase());
  })
  .map(user => (
    <View key={user.id}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("AuthFlow", {
            screen: "Chat Details",
            params: {
              contact: {
                id: user.id,
                name: user.name,
                avatar: user.image,
              }
            }
          })
        }
        style={styles.rowContainer}
      >
        <View style={styles.box}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user.image }}
              style={styles.avatar80X80}
              resizeMode="cover"
            />
            <View>
              {user.online_status === "online" ? (
                <View style={styles.onlineIndicator} />
              ) : (
                <View style={styles.offlineIndicator} />
              )}
            </View>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.nameText}>{user.name}</Text>
          <Text style={styles.message}>{user.type}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.separator} />
    </View>
))}


          </ScrollView>
        )}
      </View>

  
      
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: hp('4%'),
    paddingHorizontal: wp('5%'),
    backgroundColor: '#FFF',
  },
  logo_timble: {
    width: wp('19%'),
    height: wp('15%'),
  },
  search:{marginHorizontal: wp('3%'), marginVertical: wp('4%')},
  horizontalScrollContainer: {
    marginHorizontal: wp('2%'),
  },
 avatarContainer: {
  position: 'relative',
},
onlineIndicator: {
  position: 'absolute',
  bottom: 0,
  right: 5,
  width: wp('4%'),
  height: wp('4%'),
  borderRadius: wp('2%'),
  backgroundColor: '#4CAF50', // Green color
  borderWidth: 2,
  borderColor: '#FFFFFF', // White border
},
offlineIndicator: {
  position: 'absolute',
  bottom: 0,
  right: 5,
  width: wp('4%'),
  height: wp('4%'),
  borderRadius: wp('2%'),
  backgroundColor: 'red', // Green color
  borderWidth: 2,
  borderColor: '#FFFFFF', // White border
},
  scrollHorizontal: {
    paddingVertical: hp('1.5%'),
  },
  box: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp('3%'),
  },
  text: {
    color: COLORS.black,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: hp('1.8%'),
  },
    newMatchesText: {
    fontSize: hp('2.3%'),
    fontWeight: "bold",
    marginBottom: hp('1%'),
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexDirectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  yellowCircleContainer: {
    width: hp('2.5%'),
    height: hp('2.5%'),
    borderRadius: hp('1.5%'),
    backgroundColor: COLORS.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp('1%'),
  },
   yellowCircleText: {
    color: COLORS.black,
    fontSize: hp('1.5%'),
    fontWeight: 'bold',
  },
  avatar: {
    width: wp('22%'),
    height: wp('22%'),
    borderRadius: wp('22%'),
    borderWidth: 4.5,
    borderColor: COLORS.secondary,
  },
  scrollVerticalContainer: {
    marginTop: hp('1.5%'),
    marginHorizontal: wp('2%'),
    flex: 1,
    
  },
  scrollVertical: {},
  rowContainer: {
    flexDirection: "row",
    marginVertical: hp('1%'),
    // backgroundColor: '#F8F9FA',
  },
  avatar80X80: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('20%'),
    borderWidth: 4.5,
    borderColor: COLORS.yellow,
    // marginRight: wp('3%'),
  },
yellowCircle: {
    width: hp('3%'),
    height: hp('3%'),
    borderRadius: hp('1.5%'), // Make it perfectly circular
    backgroundColor: COLORS.yellow,
    color: COLORS.black,
    fontSize: hp('1.4%'),
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center', // Center vertically on Android
    lineHeight: hp('3%'), // Match the height for vertical centering
    marginLeft: wp('1%'),
    // Remove duplicate properties and conflicting values
    overflow: 'hidden', // Ensure content stays within circle
  },
  separator: {
    height: 0.5,
    backgroundColor: COLORS.pink,
    marginVertical: hp('1.5%'),
  },
  textContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: wp('2%'),
    flexShrink: 1,
  },
  nameText: {
    fontSize: hp('2.2%'),
    fontWeight: "bold",
  },
  message: {
    fontSize: hp('1.8%'),
    fontWeight: "300",
    color: COLORS.black,
    marginTop: hp('0.5%'),
  },
});

export default ChatScreen;
