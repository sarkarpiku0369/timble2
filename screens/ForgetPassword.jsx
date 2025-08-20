import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView,TextInput, TouchableOpacity, Image, StyleSheet, Keyboard } from 'react-native';
import API_ENDPOINTS from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {widthPercentageToDP as wp, heightPercentageToDP as hp,} from 'react-native-responsive-screen';
import { GlobalToast } from '../utils/GlobalToast'; // Adjust the import path as needed
export default function ForgetPassword({ navigation }) {
  const [username, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

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

 const handleReset = async () => {

  if (!username) {
   // alert('Please enter your email or mobile number');
     GlobalToast.showError("Error", "Please enter your email or mobile number");
    return;
  }

  setIsLoading(true);

  try {
     const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_or_phone: username,
      }),
    });
    const result = await response.json();
    //console.log('username',result);
    if (result.success) {
      GlobalToast.showSuccess("Delete Successful", "Image deleted successfully!");
      const message = result.message;
      const otpMatch = message.match(/(\d{4,6})/);
      const otp = otpMatch ? otpMatch[0] : '';
      alert(`Your OTP IS: ${otp}`);
      navigation.navigate('VerifyOtp', {
        email: result.data.email_or_phone,
        user_id: result.data.user_id,
      });

    } else {
      alert(result.message || 'Failed to send OTP');
    }
  } catch (error) {
    alert('Error sending OTP. Please try again.');
    console.error(error);
  } finally {
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
      <View style={[styles.body, { marginTop: isKeyboardVisible ? hp("18%") : hp("36%") }]}>
        <Text style={styles.title}>Forget Password!</Text>
        <Text style={styles.subtitle}>Forget Password to Continue</Text>

        {/* Email / Mobile */}
        <View style={styles.inputWrapper}>
          <TextInput
            value={username}
            onChangeText={setEmail}
            placeholder="Email or mobile"
            placeholderTextColor="#999"
            style={styles.input}
          />
        </View>
<View style={styles.centerButton}>
         <TouchableOpacity style={styles.button} onPress={handleReset} disabled={isLoading}>
          <Text style={styles.buttonText}>
            {isLoading ? 'Reset...' : 'Reset Password'}
          </Text>
        </TouchableOpacity>
        </View>
        {/* Sign-Up */}
        <TouchableOpacity style={styles.signupRow} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.signupText}>Don’t have an account? </Text>
          <Text style={[styles.signupText, styles.signupLink]}>Sign in</Text>
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
    paddingBottom: 10,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    zIndex: -1,
  },
 balloons: {
    width: wp('100%'),
    height: hp('100%'),
    resizeMode: 'cover',
  },
  body: {
    flex: 1,
    paddingHorizontal: 32,
    marginTop: wp('80%'),
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
    marginBottom: 20,
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
  button: {
    backgroundColor: '#fff',
    borderRadius: 30,
        width: wp("60%"),
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
    marginTop: 32,
  },
  centerButton: {
flex: 1,
alignItems: 'center'
  },
  signupText: {
    color: '#000',
  },
  signupLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

