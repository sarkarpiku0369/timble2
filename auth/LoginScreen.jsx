import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView,TouchableOpacity, Image, StyleSheet, Keyboard } from 'react-native';
import API_ENDPOINTS from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {widthPercentageToDP as wp, heightPercentageToDP as hp,} from 'react-native-responsive-screen';
import {GlobalToast} from '../utils/GlobalToast'; // Adjust the import path as needed
import TermsAgree from '../components/TermsAgree';

export default function LoginScreen({ navigation }) {
  const [username, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleLogin = async () => {
  if (!username || !password) {
    //alert('Please enter email and password');
    GlobalToast.showError("Missing Fields", "Please enter email and password");
    return;
  }
  setIsLoading(true);
  try {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json();
    if (result.success && result.data) {
    // store to local
    await AsyncStorage.setItem(
      'userData',
      JSON.stringify({
        user_id: result.data.user_id,
        username: result.data.username,
        token: result.data.token,
      })
    );

  // show beautiful message
  GlobalToast.showSuccess("Login Successful", "Welcome back!"); // you can replace with Toast if you want
  // delay 3 seconds
  // setTimeout(() => {
    navigation.replace("MainApp");
  // }, 3000);
}else {
     // alert(result.message || "Invalid credentials");
      GlobalToast.showError("Error", "Invalid credentials");
    }
  } catch (err) {
    console.error(err);
   // alert("Something went wrong. Please try again later.");
    GlobalToast.showError("Error", "Something went wrong. Please try again later.");
  }finally {
      setIsLoading(false);
  }
};

  return (
    <View style={styles.container}>
      {/* Header Illustration */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/signin.webp')}
          style={styles.balloons}
        />
      </View>
      <ScrollView style={styles.scrolltop}>
      {/* Form */}
      <View style={[styles.body, { marginTop: isKeyboardVisible ? hp("3.5%") : hp("32%") }]}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to Continue</Text>

        {/* Email / Mobile */}
        <View style={styles.inputWrapper}>
        <Image
          source={require('../assets/images/Group.png')}
          style={styles.group}
        />
          <TextInput
            value={username}
            onChangeText={setEmail}
            placeholder="Email or mobile"
            placeholderTextColor="#999"
            style={styles.input}
          />
        </View>

        {/* Password */}
        <View style={styles.inputWrapper}>
         <Image
          source={require('../assets/images/lock.png')}
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
        <TouchableOpacity 
  onPress={() => setSecure(!secure)} 
  style={styles.eyeButton}
>
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
        <TouchableOpacity onPress={() => navigation.navigate('Forget Password')}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

<View style={styles.centerButton}>
         <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
          <Text style={styles.buttonText}>
            {isLoading ? 'Logging in...' : 'Sign in'}
          </Text>
        </TouchableOpacity>
</View>
<TermsAgree/>
{/* <View style={styles.googleFlexButton}>
 <TouchableOpacity style={styles.googleButton} onPress={handleLogin} disabled={isLoading}>
    <Image
      source={require('../assets/images/devicon_google.png')}
      style={styles.group}
    />
    <Text style={styles.GoogleButtonText}>Sign in with Google
    </Text>
  </TouchableOpacity>
</View> */}
        {/* Sign-Up */}
        <TouchableOpacity style={styles.signupRow} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupText}>Don’t have an account? </Text>
          <Text style={[styles.signupText, styles.signupLink]}>Sign up</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrolltop: {
    paddingBottom: hp('2%'),
  },
  group: {
 marginRight: 15,
width: 20,
height: 20
  },
eye: { 
  marginRight: 0,
  width: 20, // bigger size
  height: 20,
  resizeMode: 'contain', // prevents cut/crop
},
  header: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    height: hp('100%'),
    zIndex: -1,
  },
  
  balloons: {
    width: wp('100%'),
    height: hp('100%'),
    resizeMode: 'cover',
  },
  body: {
    flex: 1,
    paddingHorizontal: wp('8%'),
    marginTop: hp('35%'),
  },
  title: {
    fontSize: wp('8%'),
    fontWeight: '700',
    color: '#000',
    marginTop: hp('2%'),
    textAlign: "center",
  },
  subtitle: {
    fontSize: wp('6%'),
    color: '#000',
    marginBottom: hp('4%'),
    textAlign: "center",
  },
inputWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: wp('8%'),
  paddingHorizontal: wp('5%'),
  height: hp('7%'),
  marginBottom: hp('2%'),
  // iOS shadow (tight and dark)
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.9,
  shadowRadius: 2,

  // Android shadow (tight and dark)
  elevation: 6,
},


  input: {
    flex: 1,
    fontSize: wp('4%'),
  },
  centerButton: {
flex: 1,
alignItems: 'center'
  },
//   googleFlexButton: {
//     paddingHorizontal: wp("2%"),
// flex: 1,
// flexDirection: 'row',
// alignItems: 'center'
//   },
  googleFlexButton: {
  flex: 1,
  justifyContent: 'center', // centers vertically
  alignItems: 'center',     // centers horizontally
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
  eyeButton: {
    padding: wp('2%'),
  },
  eyeText: {
    color: '#FF4081',
    fontSize: wp('4%'),
    fontWeight: '600',
  },
  forgot: {
    alignSelf: 'flex-end',
    color: '#FF4081',
    marginBottom: hp('3%'),
    fontSize: wp('3.8%'),
    fontWeight: "bold",
    textDecorationLine: 'underline'
  },
  button: {
    width: wp("60%"),
    alignItems: "center",
    backgroundColor: '#fff',
    borderRadius: wp('8%'),
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
    GoogleButtonText: {
    fontSize: wp('4%'),
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    marginVertical: hp('3%'),
    color: '#000',
    fontSize: wp('4%'),
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: wp('6%'),
  },
  socialBtn: {
    backgroundColor: '#fff',
    borderRadius: wp('12%'),
    padding: wp('3%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  socialIcon: {
    fontSize: wp('6%'),
    color: '#4285F4',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp('2%'),
    paddingBottom: wp('2%')
  },
  signupText: {
    color: '#000',
    fontSize: wp('3.8%'),
  },
  signupLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  underline: {
    height: 2,
    width: wp('30%'),
    backgroundColor: 'black',
    marginVertical: hp('2%'),
    justifyContent: "center",
    alignContent: "center",
  },
});

