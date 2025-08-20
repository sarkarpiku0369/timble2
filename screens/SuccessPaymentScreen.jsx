// screens/SuccessPaymentScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const SuccessPaymentScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Icon name="checkmark-circle" size={100} color="#4CAF50" />
      <Text style={styles.title}>Payment Successful</Text>
      <Text style={styles.message}>Your hearts have been added successfully.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Wallet', { screen: 'Wallet' })} // or any screen you prefer
      >
        <Text style={styles.buttonText}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SuccessPaymentScreen;

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
    color: '#4CAF50',
  },
  message: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    color: '#333'
  },
  button: {
    marginTop: 30,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16
  }
});
