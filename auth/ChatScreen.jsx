import React, { useEffect, useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import {
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS} from "../constants/StyleConfig";
import API_ENDPOINTS from "../apiConfig";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import CommonHeader from "../components/CommonHeader";

const ChatScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [newMatch, setNewMatch] = useState([]);
   const [message, setMessage] = useState(null);
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

  useFocusEffect(
    React.useCallback(() => {
      let intervalId = null;

      const fetchUsers = async () => {
        if (!token) {
          Alert.alert("Authentication Error", "No token found. Please login again.");
          return;
        }
        try {
          const response = await fetch(API_ENDPOINTS.GET_USER_LIST, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });

          const data = await response.json();
 // Then in your code:
if (data.success) {
  setUsers(data.data);
  setNewMatch(data.newmatch || []);
  
  // Store data using AsyncStorage
  try {
    await AsyncStorage.setItem('message', JSON.stringify(data.allunseencount || null));
    setMessage(data || null);
  } catch (error) {
    console.error('Error saving to AsyncStorage:', error);
    setMessage(data || null); // Still set state even if storage fails
  }
  
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
        fetchUsers(); // run immediately when screen is focused
        intervalId = setInterval(fetchUsers, 10000); // then every 10s
      }

      // cleanup when screen is unfocused
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }, [token])
  );
  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.pink} />;
  }
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <CommonHeader search={true} setSearchPerson={setSearchPerson} searchPerson={searchPerson} />

      {/* Matches */}
      <View style={{backgroundColor: '#fff'}}>
        <View style={styles.horizontalScrollContainer}>
          <Text style={styles.newMatchesText}>
            New Matches {searchPerson && <Text>for "{searchPerson}"</Text>}
          </Text>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={styles.scrollHorizontal}
          >
            {newMatch.map((user) => (
              <View key={user.id} style={styles.box}>
                <Image
                  source={{ uri: user.image }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
                <View>
                  {user.online_status === "online" ? (
                    <View style={styles.newonlineIndicator} />
                  ) : (
                    <View style={styles.newofflineIndicator} />
                  )}
                </View>
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
          {/* <Text>{JSON.stringify(message, null, 2)}</Text> */}
           {/* <Text>{JSON.stringify(message.allunseencount, null, 2)}</Text> */}
           {message.allunseencount > 0 && (
          <View style={styles.yellowCircleContainer}>
            <Text style={styles.yellowCircleText}>{message.allunseencount|| 0}</Text>
          
          </View>
           )}
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
                             status: user.online_status,
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
                      <View style={styles.flexDirectionRow}>


                      <Text style={styles.nameText}>{user.name}</Text>
                          {user.unseen_count > 0 && (
                        <View style={styles.yellowCircleContainer}>
   <Text style={styles.yellowCircleText}>{user.unseen_count|| 0}</Text>
   </View>
                            )}
         
            {/* <Text>{JSON.stringify(message.showMessage, null, 2)}</Text> */}
          
                      </View>
                      <Text style={styles.message}>{user.last_message}</Text>
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
    paddingBottom: wp('15%'),
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
    backgroundColor: 'red', // Red color
    borderWidth: 2,
    borderColor: '#FFFFFF', // White border
  },
  newonlineIndicator: {
    position: 'relative',
    bottom: 0,
    right: 0,
    left: 10,
    width: wp('4%'),
    height: wp('4%'),
    borderRadius: wp('2%'),
    backgroundColor: '#4CAF50', // Green color
    borderWidth: 2,
    borderColor: '#FFFFFF', // White border
  },
  newofflineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 10,
    width: wp('4%'),
    height: wp('4%'),
    borderRadius: wp('2%'),
    backgroundColor: 'red', // Red color
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