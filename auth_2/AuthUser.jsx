import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
    Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {widthPercentageToDP as wp, heightPercentageToDP as hp,} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment'; // For formatting the date
import API_ENDPOINTS from '../apiConfig';

export default function AuthUser({ navigation }) {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [token, setUsertoken] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
   const [isKeyboardVisible, setKeyboardVisible] = useState(false); // <-- Add this
    
         useEffect(() => {
           const keyboardDidShowListener = Keyboard.addListener(
             'keyboardDidShow',
             () => {
               setKeyboardVisible(true); // Keyboard is shown
             }
           );
           const keyboardDidHideListener = Keyboard.addListener(
             'keyboardDidHide',
             () => {
               setKeyboardVisible(false); // Keyboard is hidden
             }
           );
         
           // Clean up function to remove listeners
           return () => {
             keyboardDidHideListener.remove();
             keyboardDidShowListener.remove();
           };
         }, []);

  // Gender values for backend
  const genderOptions = ['male', 'female', 'other'];
  
  // User-friendly gender display options
  const genderDisplayOptions = {
    male: 'Male',
    female: 'Female',
    other: 'Other'
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const stored = await AsyncStorage.getItem('userData');
        if (stored) {
          const user = JSON.parse(stored);
          setUsername(user.username || '');
          setUsertoken(user.token || '');
          setFullname(user.fullname || '');  // Assuming the fullname exists in the stored data
        }
      } catch (e) {
        console.error("Failed to load user data", e);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    // Enable button when all fields are filled
    if (fullname && gender && dob) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [fullname, gender, dob]);

  const handleContinue = async () => {
    const userDetails = {
      fullname,
      gender,
      dob,
    };

    // Ensure that the gender is valid before proceeding
    if (!genderOptions.includes(gender)) {
      Alert.alert("Invalid Gender", "Please select a valid gender.");
      return;
    }

    try {
      if (!token) {
        Alert.alert("Authentication Error", "No token found. Please login again.");
        return;
      }

      const response = await fetch(API_ENDPOINTS.PERSONAL_DETAILS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Add token to the request header
        },
        body: JSON.stringify(userDetails),
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert(result.message || "Details updated successfully!");
        // Optionally, navigate to another screen if necessary
        navigation.navigate('Your Interests');
      } else {
        Alert.alert(result.message || "Failed to update details.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Something went wrong. Please try again later.');
    }
  };

  const handleDatePickerConfirm = (date) => {
    setDob(moment(date).format('YYYY-MM-DD')); // Format the date to 'YYYY-MM-DD'
    setDatePickerVisible(false);
  };

  const handleDatePickerCancel = () => {
    setDatePickerVisible(false);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/signin.webp')} style={styles.backgroundImage} />

      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={[styles.formContent,{ marginTop: isKeyboardVisible ? hp("0%") : hp("15%") } ]}>
          <View style={[styles.fieldContainer, { display: "none" }]}>
            <Text style={styles.label}>User name</Text>
            <View style={styles.inputWrapper}>
              <Icon name="user" size={20} color="#FF4081" style={styles.inputIcon} />
              <TextInput
                value={username}
                editable={false}  // Disable the input field
                style={[styles.input, { backgroundColor: '#f2f2f2' }]} // Slightly gray background for a disabled field
              />
            </View>
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Full name</Text>
            <View style={styles.inputWrapper}>
             <Image
                       source={require('../assets/images/Group.png')}
                       style={styles.group}
                     />
              <TextInput
                value={fullname}
                onChangeText={setFullname}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                style={styles.input}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Gender</Text>
            <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowGenderDropdown(true)}>
                <Image
                       source={require('../assets/images/gender.png')}
                       style={styles.group}
                     />
              <Text style={[styles.input, !gender && { color: '#999' }]}>
                {genderDisplayOptions[gender] || "Select your gender"}
              </Text>
              <Icon name="caret-down" size={18} color="#999" />
            </TouchableOpacity>
          </View>

          <Modal
            visible={showGenderDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowGenderDropdown(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowGenderDropdown(false)}
            >
              <View style={styles.dropdownContainer}>
                {genderOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setGender(option);
                      setShowGenderDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownOptionText}>{genderDisplayOptions[option]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity style={styles.inputWrapper} onPress={() => setDatePickerVisible(true)}>
             <Image
                       source={require('../assets/images/birthday.png')}
                       style={styles.group}
                     />
              <Text style={styles.input}>
                {dob || "Select your date of birth"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker Modal */}
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            date={dob ? moment(dob, 'YYYY-MM-DD').toDate() : new Date()}
            onConfirm={handleDatePickerConfirm}
            onCancel={handleDatePickerCancel}
            maximumDate={new Date()}
            headerTextIOS="Select Date"
          />
          
      <View style={styles.centerButton}> <TouchableOpacity
            style={[styles.button, isButtonDisabled]}
            onPress={handleContinue}
            disabled={isButtonDisabled}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity></View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    resizeMode: 'cover',
      height: hp('100%'),
  },
   group: {
 marginRight: 15,
width: 20,
height: 20
  },
   centerButton: {
flex: 1,
alignItems: 'center'
  },
  formContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
 
  },
  formContent: {
    borderRadius: 20,
    padding: 25,
    top: 37,
  },
 fieldContainer: {
  marginBottom: 20,
  shadowColor: '#000',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  shadowOffset: {
    width: 0,
    height: 2, // This creates the bottom shadow
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
},
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    marginLeft: 15,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 56,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
     shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  button: {
        width: wp("60%"),
    backgroundColor: '#fff',
    borderRadius: 30,
    alignItems: 'center',
     paddingVertical: hp('1.6%'),
    marginTop: 20,
    elevation: 3,
    
  },
  
  buttonText: {
 fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#000',
  
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '80%',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
  },
});

