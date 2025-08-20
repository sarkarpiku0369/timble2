import React, {useState, useEffect, useRef} from 'react';
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,Image,Alert, Modal,TextInput,StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_ENDPOINTS from '../apiConfig';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
const ProfileScreen = () => {
  const navigation = useNavigation();
  const [token, setUsertoken] = useState('');
  //Interests
  const [interestCategories, setInterestCategories] = useState([]);
  const [interestsModalVisible, setInterestsModalVisible] = useState(false);
  const [selectedInterestMap, setSelectedInterestMap] = useState({});
  const [about, setAbout] = useState();
  const [AboutModalVisible, setAboutModalVisible] = useState(false);
  //const [GenderModalVisible, setGenderModalVisible] = useState(false);
  //gender
  //const [open, setOpen] = useState(false);
  //const [value, setValue] = useState(null);
  // const [items, setItems] = useState([
  //   {label: 'Male', value: 'male'},
  //   {label: 'Female', value: 'female'},
  //   {label: 'Other', value: 'other'}
  // ]);
  //user Details
  const [name, setUserName] = useState();
    const [userData, setuserData] = useState();
    const [personalData, setpersonalData] = useState();
  //const [age, setUserAge] = useState();
  //const [address, setUserAddress] = useState();
   // Fetch the user data and token from AsyncStorage
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const stored = await AsyncStorage.getItem('userData');
                if (stored) {
                    const user = JSON.parse(stored);
                    setUsertoken(user.token || ''); // Set token
                }
            } catch (e) {
                console.error("Failed to load user data", e);
            }
        };
        loadUserData();
    }, []);  // This useEffect runs once when the component mounts

        // Fetch data from API with GET method and token in headers
    useEffect(() => {
      //console.log('token',token);
        const fetchInterestsData = async () => {
            if (!token) {
                Alert.alert("Authentication Error", "No token found. Please login again.");
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
                      setInterestCategories(data.data);
                    setuserData(data.data);
                  } else {
                    Alert.alert("Error", "Failed to fetch interests data.");
                }
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "Something went wrong.");
            }
        };

        if (token) {
            fetchInterestsData();  // Fetch data only when token is available
        }
    }, [token]);  // This useEffect runs whenever token changes

    const handleLogout = async () => {
      try {
        const stored = await AsyncStorage.getItem('userData');
        if (!stored) {
          Alert.alert('Error', 'User not logged in');
          //navigation.navigate('Login');
          navigation.navigate('AuthFlow', { screen: 'Login' });

          return;
        }
        const user = JSON.parse(stored);
        const token = user.token || '';
        //console.log('token',token);
        const response = await fetch(API_ENDPOINTS.LOGOUT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        const data = await response.json();
        //console.log('data',data);
         //console.log('token',token);
        if (data && data.success) {
          await AsyncStorage.removeItem('userData');
          //navigation.navigate('Login');
           navigation.navigate('AuthFlow', { screen: 'Login' });
        } else {
          Alert.alert('Logout Failed', data.message || 'Something went wrong.');
        }
      } catch (error) {
        console.error('Logout Error:', error);
        Alert.alert('Error', 'Unable to logout. Please try again.');
      }
    };

     // Extract selected titles to show on profile
  const selectedInterestTitles = interestCategories.flatMap(category =>
    (selectedInterestMap[category.id]?.length || 0) > 0
      ? category.details
          .filter(detail => selectedInterestMap[category.id].includes(detail.id))
          .map(detail => detail.title)
      : []
  );
//handleSaveInterests insert post method
  const handleSaveInterests = async () => {
  try {
    const stored = await AsyncStorage.getItem('userData');
    const user = JSON.parse(stored || '{}');
    const token = user.token || '';
    //console.log('token',token);
    //console.log('selectedInterestMap',selectedInterestMap);
    const response = await fetch('https://webtechnomind.in/project/timble/api/store-user-interests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
       body: JSON.stringify({
          interests_data: JSON.stringify(selectedInterestMap),
      }),
    });

    const json = await response.json();
    if (response.ok && json.success) {
      
      Alert.alert('Success', 'Interests saved successfully.');
      setInterestsModalVisible(false);
      fetchPersonalDetails(); // Refresh after save
    } else {
      Alert.alert('Error', json.message || 'Something went wrong.');
    }
  } catch (err) {
    console.error('Save error:', err);
    Alert.alert('Error', 'Unable to save interests.');
  }
};

// Create a ref to store the last fetched data for comparison
const lastFetchedData = useRef(null);
// Ref to hold the interval ID for cleanup
const intervalRef = useRef();

const fetchPersonalDetails = async () => {
  try {
    const stored = await AsyncStorage.getItem('userData');
    const user = JSON.parse(stored || '{}');
    const token = user.token || '';

    const response = await fetch('https://webtechnomind.in/project/timble/api/get-personal-details', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    const result = await response.json();
    if (result.success) {
      setuserData(result.data);
      setpersonalData(result.data);
      const interests = result.data.interests || {};
      const about = result.data.about_me;
      const profileImage = result.data.profile_image;
      const mathchParssentence = result.data.mathch_parssentence;
      const gender = result.data.gender;
      const fullname = result.data.fullname;
      setUserName(fullname);
      //console.log('interests', );
      // Check if data has changed from the last fetch
      const hasChanged = !lastFetchedData.current || 
        about !== lastFetchedData.current.about_me ||
        gender !== lastFetchedData.current.gender ||
        JSON.stringify(interests) !== JSON.stringify(lastFetchedData.current.interests);

      if (hasChanged) {
        console.log('New records detected, updating state...');
        setAbout(about);
        setSelectedInterestMap(interests);
        //setValue(gender);
        lastFetchedData.current = result.data; // Update reference
      }
      
      return result.data;
    } else {
      console.log('Failed to fetch personal details:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching personal details:', error);
    return null;
  }
};

useEffect(() => {
  let isMounted = true;

  // Initial fetch
  const fetchInitial = async () => {
    const data = await fetchPersonalDetails();
    if (isMounted) {
      // Start polling only after initial fetch completes
      startPolling();
    }
  };

  // Start periodic polling (every 60 seconds)
  const startPolling = () => {
    intervalRef.current = setInterval(async () => {
      await fetchPersonalDetails();
    }, 60000); // 60 seconds
  };

  fetchInitial();

  // Cleanup on unmount
  return () => {
    isMounted = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
}, []);



const handleSaveAboutMe = async () => {
  //console.log('piku',about);
  try {
    const stored = await AsyncStorage.getItem('userData');
    const user = JSON.parse(stored || '{}');
    const token = user.token || '';

    const formData = new FormData();
    formData.append('about_me', about);

    const response = await fetch('https://webtechnomind.in/project/timble/api/update/profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      //setAbout(aboutText); // update local state
      Alert.alert('Success', 'About me updated successfully!');
      setAboutModalVisible(false);
    } else {
      Alert.alert('Error', result.message || 'Update failed');
    }
  } catch (error) {
    console.error('Error updating about_me:', error);
    Alert.alert('Error', 'Something went wrong. Please try again.');
  }
};

//gender
// const handleSaveGender = async () =>{
//   //console.log('gender',value);
//   try {
//     const stored = await AsyncStorage.getItem('userData');
//     const user = JSON.parse(stored || '{}');
//     const token = user.token || '';

//     const formData = new FormData();
//     formData.append('gender', value);

//     const response = await fetch('https://webtechnomind.in/project/timble/api/update/profile', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Accept': 'application/json',
//       },
//       body: formData,
//     });

//     const result = await response.json();

//     if (result.success) {
//       //setAbout(aboutText); // update local state
//       Alert.alert('Success', 'About me updated successfully!');
//     } else {
//       Alert.alert('Error', result.message || 'Update failed');
//     }
//   } catch (error) {
//     console.error('Error updating about_me:', error);
//     Alert.alert('Error', 'Something went wrong. Please try again.');
//   }
// }
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header area start */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../assets/images/home-logo.png')} style={styles.logo} />
          {/* <Text style={styles.logoText}>TIMBLE</Text> */}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Wallet')}>
            <Icon name="card-giftcard" size={24} color="#FFD700" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Edit Profile')}>
            <Icon name="settings" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={handleLogout}>
            <Icon name="logout" size={24} color="#F93CA6" />
          </TouchableOpacity>
          {/* <Image
  source={{ uri: 'https://webtechnomind.in/project/timble/public/uploads/user_pictures/1755106741_689ccdb545414_photo_2.jpg' || 'https://example.com/default.png' }}
/> */}
        </View>
      </View>
      {/* Header area end */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.progressRing}>
              <View style={styles.profileImagePlaceholder}>
                {/* <Icon name="person" size={60} color="#999" /> */}
               { personalData?.profile_image ? (
  <Image
  style={{ width: '100%', height: '100%', borderRadius: 50 }}
    source={{ uri: personalData.profile_image }}
  />
) : (
  <Icon name="person" size={60} color="#999" />
)}
              </View>
            </View>
            {/* <TouchableOpacity style={styles.editButton}>
              <Icon name="edit" size={16} color="#000" />
            </TouchableOpacity> */}
          </View>
          
          <View style={styles.completionBadge}>
            {personalData && personalData.match_parsentence !== undefined ? (
              <Text style={styles.completionText}>{personalData.match_parsentence || 0}% COMPLETE</Text>
            ) : (
              <Text style={styles.completionText}>0% COMPLETE</Text>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <View style={styles.nameContainer}>
                   {personalData  ? (
              <Text style={styles.userName}>{name || 'User'}, {personalData.age || 0}</Text>
                   ) : (
                     <Text style={styles.userName}>{name}, 27</Text>
            )}
              
               <TouchableOpacity onPress={() =>navigation.navigate('AuthFlow', { screen: 'FaceVerify' })}>
                <Icon name="verified" size={20} color="#E91E63" />
              </TouchableOpacity>
            </View>
            <View style={styles.locationContainer}>
              <Icon name="location-on" size={16} color="#666" />
              <Text style={styles.location}>New York, NY</Text>
            </View>
          </View>
        </View>

        {/* About Me Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>About me</Text>
            <TouchableOpacity onPress={() => setAboutModalVisible(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionContent}>
           {about}
          </Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <TouchableOpacity onPress={() => setInterestsModalVisible(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.hobbiesContainer}>
           {selectedInterestTitles.map((title, index) => (
            <View key={index} style={styles.hobbyTag}>
              <Text style={styles.hobbyText}>{title}</Text>
              {/* <Text>{JSON.stringify(userData, null, 2)}</Text> */}
            </View>
          ))}
          </View>
        </View>

  
        
          
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gender</Text>
            <TouchableOpacity onPress={() => setGenderModalVisible(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionContent}>
          {value}
          </Text>
        </View> */}
        
      </ScrollView>

      {/* Bottom Navigation */}
      
      <Modal
        visible={AboutModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit About Me</Text>
                <TouchableOpacity onPress={() => setAboutModalVisible(false)}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            
               <TextInput
              value={about}
              onChangeText={setAbout}
              multiline
              numberOfLines={4}
              style={styles.input}
              placeholder="Write something about yourself"
            />
            <TouchableOpacity style={styles.closeButton} onPress={handleSaveAboutMe}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
{/* interest */}
      <Modal
        visible={interestsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInterestsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Interests</Text>
                <TouchableOpacity onPress={() => setInterestsModalVisible(false)}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            <ScrollView style={{ maxHeight: 350 }}>
              {interestCategories.map((category, catIndex) => (
                <View key={catIndex} style={{ marginBottom: 20 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
                    {category.name}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {category.details.map((item, itemIndex) => {
                      const isSelected =
                        selectedInterestMap[category.id]?.includes(item.id) || false;

                      return (
                        <TouchableOpacity
                          key={itemIndex}
                          style={[
                            styles.hobbyTag,
                            { backgroundColor: isSelected ? '#F93CA6' : '#eee' },
                          ]}
                          onPress={() => {
                            setSelectedInterestMap(prev => {
                              const catId = category.id;
                              const current = prev[catId] || [];
                              const updated = isSelected
                                ? current.filter(id => id !== item.id)
                                : [...current, item.id];

                              const result = {
                                ...prev,
                                [catId]: updated,
                              };

                              if (result[catId].length === 0) {
                                delete result[catId];
                              }

                              return { ...result };
                            });
                          }}
                        >
                          <Text style={{
                            color: isSelected ? '#fff' : '#333',
                            fontWeight: '500',
                          }}>
                            {item.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.closeButton} onPress={handleSaveInterests}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
        {/* gender */}
      {/* <Modal
        visible={GenderModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit About Me</Text>
                <TouchableOpacity onPress={() => setGenderModalVisible(false)}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            
             <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
              />
            <TouchableOpacity style={styles.closeButton} onPress={handleSaveGender}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}


    </View>
  );
};

const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    //paddingVertical: hp('4%'),
    backgroundColor: '#FFF',
    top:hp('1%'),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: wp('15%'),
    height: hp('9%'),
    marginRight: wp('2%'),
    resizeMode: 'contain'
  },
  logoText: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#E91E63',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: wp('4%'),
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: hp('2%'),
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: hp('1.5%'),
  },
  progressRing: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('15%'),
    borderWidth: wp('1%'),
    borderColor: '#F93CA6',
    borderTopColor: '#F93CA6',
    borderRightColor: '#F93CA6',
    borderBottomColor: '#F93CA6',
    borderLeftColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  profileImagePlaceholder: {
    width: wp('25%'),
    height: wp('25%'),
    borderRadius: wp('12.5%'),
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: hp('1.5%'),
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: '#FFCA30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionBadge: {
    backgroundColor: '#F93CA6',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('5%'),
    marginBottom: hp('1.5%'),
  },
  completionText: {
    color: '#fff',
    fontSize: wp('3%'),
    fontWeight: 'bold',
  },
  userInfo: {
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  userName: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#333',
    marginRight: wp('1%'),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginLeft: wp('0.5%'),
  },
  section: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  sectionTitle: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#333',
  },
  editText: {
    fontSize: wp('3.5%'),
    color: '#F93CA6',
  },
  sectionContent: {
    fontSize: wp('3.5%'),
    color: '#999',
    lineHeight: hp('2.5%'),
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: hp('0.5%'),
  },
  hobbyTag: {
    backgroundColor: '#FFD700',
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('0.8%'),
    borderRadius: wp('5%'),
    marginRight: wp('2%'),
    marginBottom: hp('1%'),
  },
  hobbyText: {
    fontSize: wp('3.5%'),
    color: '#333',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: wp('5%'),
    borderTopLeftRadius: wp('5%'),
    borderTopRightRadius: wp('5%'),
    maxHeight: hp('70%'),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  modalTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
  },
  closeIcon: {
    fontSize: wp('6%'),
    color: '#333',
    padding: wp('1%'),
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp('2%'),
    padding: wp('3%'),
    fontSize: wp('4%'),
    minHeight: hp('15%'),
    textAlignVertical: 'top',
  },
  closeButton: {
    backgroundColor: '#F93CA6',
    padding: wp('3%'),
    borderRadius: wp('2%'),
    marginTop: hp('2%'),
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp('4%'),
  },
  // For the dropdown in gender modal
  dropdownContainer: {
    marginTop: hp('1%'),
    zIndex: 1000,
  }
});
export default ProfileScreen;