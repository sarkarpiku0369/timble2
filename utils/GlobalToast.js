// src/components/GlobalToast.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

export const toastConfig = {
  success: ({ text1, text2, hide }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d4f6e3', // light green
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 20,
        elevation: 5,
      }}
    >
      {/* Left Icon Circle */}
      <View
        style={{
          height: 32,
          width: 32,
          borderRadius: 16,
          backgroundColor: '#4CAF50', // green
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 10,
        }}
      >
        <Icon name="checkmark" size={18} color="#fff" />
      </View>

      {/* Text Section */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: wp('4%'), fontWeight: 'bold', color: '#000' }}>
          {text1}
        </Text>
        {text2 ? (
          <Text style={{ fontSize: wp('3.5%'), color: '#333' }}>{text2}</Text>
        ) : null}
      </View>

      {/* Close Button */}
      <TouchableOpacity onPress={hide}>
        <Icon name="close" size={20} color="#333" />
      </TouchableOpacity>
    </View>
  ),

  error: ({ text1, text2, hide }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8d7da', // light red
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 20,
        elevation: 5,
      }}
    >
      {/* Left Icon Circle */}
      <View
        style={{
          height: 32,
          width: 32,
          borderRadius: 16,
          backgroundColor: '#dc3545', // red
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 10,
        }}
      >
        <Icon name="close" size={18} color="#fff" />
      </View>

      {/* Text Section */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: wp('4%'), fontWeight: 'bold', color: '#000' }}>
          {text1}
        </Text>
        {text2 ? (
          <Text style={{ fontSize: wp('3.5%'), color: '#333' }}>{text2}</Text>
        ) : null}
      </View>

      {/* Close Button */}
      <TouchableOpacity onPress={hide}>
        <Icon name="close" size={20} color="#333" />
      </TouchableOpacity>
    </View>
  ),
};

// Global Toast Functions
export const GlobalToast = {
  showSuccess: (title, message) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'bottom', // show at bottom
      visibilityTime: 3000,
    });
  },
  showError: (title, message) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'bottom',
      visibilityTime: 3000,
    });
  },
};

export default Toast;
