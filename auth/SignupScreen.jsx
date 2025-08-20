import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Keyboard, // <-- Add this
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {widthPercentageToDP as wp, heightPercentageToDP as hp,} from 'react-native-responsive-screen';
import API_ENDPOINTS from '../apiConfig';
import TermsAgree from '../components/TermsAgree';
import {GlobalToast} from '../utils/GlobalToast';
export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setcPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [confirmSecure, setConfirmSecure] = useState(true);
  const [inputError, setInputError] = useState('');
    const [isKeyboardVisible, setKeyboardVisible] = useState(false); // <-- Add this

  // Helper function to detect if input is a number
  const isNumeric = (str) => {
    return /^\d+$/.test(str);
  };

  // Helper function to validate Gmail
  const isValidGmail = (email) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

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

  // Enhanced email/mobile handler
  const handleEmailChange = (text) => {
    setInputError(''); // Clear previous errors
    
    if (isNumeric(text)) {
      // If it's numeric, limit to 10 digits
      if (text.length <= 10) {
        setEmail(text);
      }
      // Validate mobile number length
      if (text.length > 0 && text.length < 10) {
        setInputError('Mobile number must be 10 digits');
      } else if (text.length === 10) {
        setInputError(''); // Valid mobile number
      }
    } else {
      // If it contains non-numeric characters, treat as email
      setEmail(text);
      
      // Validate Gmail format if @ symbol is present
      if (text.includes('@')) {
        if (!isValidGmail(text)) {
          setInputError('Only Gmail addresses are allowed');
        } else {
          setInputError(''); // Valid Gmail
        }
      }
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !confirmpassword) {
      //alert("Please fill all fields");
      GlobalToast.showError("Error", "Please fill all fields");
      return;
    }

    // Additional validation before signup
    if (isNumeric(email) && email.length !== 10) {
      //alert("Mobile number must be exactly 10 digits");
      GlobalToast.showError("Error", "Mobile number must be exactly 10 digits");
      return;
    }

    if (!isNumeric(email) && !isValidGmail(email)) {
      //alert("Please enter a valid Gmail address");
      GlobalToast.showError("Error", "Please enter a valid Gmail address");
      return;
    }

    if (password !== confirmpassword) {
      //alert("Passwords do not match");
       GlobalToast.showError("Error", "Passwords do not match");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          password: password,
          password_confirmation: confirmpassword,
        }),
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        // extract OTP from message
        const message = result.message;
        const otpMatch = message.match(/(\d{4,6})/);
        const otp = otpMatch ? otpMatch[0] : '';

        // store in AsyncStorage
        await AsyncStorage.setItem(
          'userData',
          JSON.stringify({
            user_id: result.data.user_id,
            username: result.data.username,
            otp: otp,
          })
        );

       // alert(`🎉 Registered successfully. OTP sent to your ${isNumeric(email) ? 'number' : 'email'}: ${otp}`);
          GlobalToast.showSuccess("Registered successfully", `OTP sent to your ${isNumeric(email) ? 'number' : 'email'}: ${otp}`);
        setTimeout(() => {
          navigation.navigate("Verify");
        }, 2000);
      } else {
        //alert(result.message || "Signup failed. Try again.");
        GlobalToast.showError("Error", "Signup failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      //alert("Something went wrong. Please try again later.");
      GlobalToast.showError("Error", "Something went wrong. Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/signin.webp')}
          style={styles.balloons}
        />
      </View>
      <ScrollView style={styles.scrolltop} >
        {/* Content */}
       <View style={[styles.body, { marginTop: isKeyboardVisible ? hp("0%") : hp("28%") }]}>
        <View style={styles.titleContainer}>
<Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Sign up to Continue</Text>

          {/* Email/Mobile with Validation */}
          <View style={styles.inputWrapper}>
            <Image
              source={require('../assets/images/Group.png')}
              style={styles.group}
            />
            <TextInput
              value={email}
              onChangeText={handleEmailChange}
              placeholder="Email or mobile"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType={isNumeric(email) ? "numeric" : "email-address"}
            />
          </View>
          
          {/* Error message */}
          {/* {inputError ? (
            <Text style={styles.errorText}>{inputError}</Text>
          ) : null} */}

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Image
              source={require('../assets/images/key.png')}
              style={styles.group}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={secure}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeButton}>
              {secure ? (
                <Image
                  source={require('../assets/images/hideeye.png')}
                  style={styles.eye}
                />
              ) : (
                <Image
                  source={require('../assets/images/eye.png')}
                  style={styles.eye}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputWrapper}>
            <Image
              source={require('../assets/images/tick_key.png')}
              style={styles.group}
            />
            <TextInput
              value={confirmpassword}
              onChangeText={setcPassword}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry={confirmSecure}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setConfirmSecure(!confirmSecure)} style={styles.eyeButton}>
              {confirmSecure ? (
                <Image
                  source={require('../assets/images/hideeye.png')}
                  style={styles.eye}
                />
              ) : (
                <Image
                  source={require('../assets/images/eye.png')}
                  style={styles.eye}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.centerButton}>
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
          
            <View style={{marginHorizontal: 20}}>
          <TermsAgree/>
            </View>

          {/* <View style={styles.googleFlexButton}>
            <TouchableOpacity style={styles.googleButton}>
              <Image
                source={require('../assets/images/devicon_google.png')}
                style={styles.group}
              />
              <Text style={styles.GoogleButtonText}>
                Sign in with Google
              </Text>
            </TouchableOpacity>
          </View> */}

          <TouchableOpacity style={styles.signupRow} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Text style={[styles.signupText, styles.signupLink]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrolltop: {
    paddingBottom: 10
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp('100%'),
    zIndex: -1,
    pointerEvents: 'none',
  },
  group: {
    marginRight: 15,
    width: 20,
    height: 20
  },
  googleFlexButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eye: {
    marginRight: 0,
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: wp('55%'),
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: wp('8%'),
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  GoogleButtonText: {
    fontSize: wp('4%'),
    fontWeight: '600',
  },
  balloons: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleContainer: {
paddingHorizontal: 30,
  },
  body: {
    flex: 1,
    paddingHorizontal: 0,
    marginTop: 270,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#000',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 56,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeButton: {
    padding: 8,
  },
  centerButton: {
    flex: 1,
    alignItems: 'center'
  },
  signupLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  button: {
    width: wp("60%"),
    backgroundColor: '#fff',
    borderRadius: 30,
    alignItems: 'center',
     paddingVertical: hp('1.6%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
  fontSize: wp('4.5%'),
    fontWeight: '600',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  signupText: {
    color: '#000',
  },
  // New error text style
  errorText: {
    color: '#FF4081',
    fontSize: 12,
    marginLeft: 20,
    marginBottom: 5,
    marginTop: -5,
  },
});