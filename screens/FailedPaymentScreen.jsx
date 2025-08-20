// screens/FailedPaymentScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const FailedPaymentScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Icon name="close-circle" size={100} color="#FF1744" />
      <Text style={styles.title}>Payment Failed</Text>
      <Text style={styles.message}>Something went wrong. Please try again.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()} // Retry payment
      >
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FailedPaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#FF1744',
  },
  message: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    color: '#333'
  },
  button: {
    marginTop: 30,
    backgroundColor: '#FF1744',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16
  }
});
