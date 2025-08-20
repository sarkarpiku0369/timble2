import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  Keyboard
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function ResetPasswordScreen({ route, navigation }) {
  const { email, otp } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
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

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const url = `https://webtechnomind.in/project/timble/api/reset-password?email_or_phone=${email}&otp=${otp}&password=${encodeURIComponent(password)}&password_confirmation=${encodeURIComponent(confirmPassword)}`;
    try {
      const response = await fetch(url, { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        alert(result.message || 'Password reset successful');
        navigation.navigate('Login');
      } else {
        alert(result.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Background */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/signin.webp')}
          style={styles.balloons}
        />
      </View>

      {/* Content */}
      <View style={[styles.body,{ marginTop: isKeyboardVisible ? hp('15%') : hp('35%') }]} >
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Set a new password for your account. 
        </Text>

        {/* New Password Input field */}
        <View style={styles.inputContainer}>
          <Image
            source={require('../assets/images/lock.png')}
            style={styles.group}
          />
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#999"
            secureTextEntry={securePassword}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setSecurePassword(!securePassword)}
            style={styles.eyeButton}
          >
            {securePassword ? (
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

        {/* Confirm Password Input field */}
        <View style={styles.inputContainer}>
          <Image
            source={require('../assets/images/lock.png')}
            style={styles.group}
          />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry={secureConfirmPassword}
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
            style={styles.eyeButton}
          >
            {secureConfirmPassword ? (
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

        {/* Reset button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Resetting...' : 'Reset Password'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp('100%'),
    zIndex: -1,
  },
  balloons: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: wp('8%'),
    // marginHorizontal: wp('4%'),
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
    marginTop: 15,
    fontSize: 18,
    color: '#000',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 30,
    marginBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginHorizontal: 10,
    height: 50,
  },
  group: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#F93CA6',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  eyeButton: {
    padding: 5,
  },
  eye: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#F93CA6',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 30,
    alignItems: 'center',
    paddingVertical: hp('1.6%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginHorizontal: 40,
    marginTop: 20,
  },
  buttonText: {
   fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#000',
  },
});