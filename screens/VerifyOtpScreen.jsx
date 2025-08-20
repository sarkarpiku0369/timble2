import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
 Keyboard, // <-- Add this
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function VerifyOtpScreen({ navigation, route }) {
const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false); // <-- Add this

  const handleChange = (text, index) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (index < 5) {
        inputs.current[index + 1].focus();
      }
    } else if (text === '') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      alert('Please enter the full 6-digit OTP');
      return;
    }
    console.log('Verifying OTP:', otpCode);
    navigation.navigate('ResetPassword', { email: email, otp: otpCode });
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
    <View style={[styles.body, { marginTop: isKeyboardVisible ? 80 : 270 }]}>
      <Text style={styles.title}>Verify Code</Text>
      <Text style={styles.subtitle}>
        We've sent a 6-digit code to{' '}
        <Text style={styles.emailText}>{email}</Text>
      </Text>

      {/* OTP Inputs */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => (inputs.current[index] = el)}
            style={[
              styles.otpInput,
              {
                color: digit ? '#000' : 'rgba(0,0,0,0.3)',
                borderBottomColor: '#000',
              },
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            returnKeyType="done"
          />
        ))}
      </View>
      <View style={styles.signupRow}>
        <Text style={styles.signupText}>Didn’t receive code</Text>
        <TouchableOpacity>
          <Text style={[styles.signupText, styles.signupLink]}>
            Resend code
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  container: { flex: 1 },
    keyboardAvoidingView: {
    flex: 1,
  },
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
    flex: 1,
    paddingHorizontal: 32,
    // marginTop: 80,
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
  emailText: {
    fontWeight: '700',
    color: '#FF4081',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  otpInput: {
    borderBottomWidth: 2,
    width: 34,
    height: 60,
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  signupRow: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop: 15,
  },
  signupText: { color: '#000', fontSize: wp('5%') },
  signupLink: {
    color: '#FF4081',
    fontWeight: '700',
    textDecorationLine: 'underline',
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
  },
  buttonText: {
     fontSize: wp('4.5%'),
    fontWeight: '600',
  },
});