import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const CalculateScreen = () => {
  const navigation = useNavigation();

  const [heartsInput, setHeartsInput] = useState('100');
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  // 🔁 Auto calculate when input changes
  useEffect(() => {
    const fetchPrice = async () => {
      const heartCount = parseInt(heartsInput);
      if (!heartCount || heartCount <= 0) {
        setCalculatedPrice(null);
        return;
      }

      try {
        const stored = await AsyncStorage.getItem('userData');
        const user = JSON.parse(stored || '{}');
        const token = user.token || '';

        const response = await fetch(
          `https://webtechnomind.in/project/timble/api/heart/calculate?heart_count=${heartCount}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        const json = await response.json();
        if (json.status === true) {
          setCalculatedPrice(json.total_amount);
        } else {
          setCalculatedPrice(null);
        }
      } catch (error) {
        console.error(error);
        setCalculatedPrice(null);
      }
    };

    fetchPrice();
  }, [heartsInput]);

  const handlePayment = async () => {
  if (!calculatedPrice) {
    Alert.alert("Error", "Please enter a valid heart amount.");
    return;
  }

  try {
    const stored = await AsyncStorage.getItem('userData');
    const user = JSON.parse(stored || '{}');
    const email = user?.email || 'guest@example.com';
    // ✅ Use dummy mobile number if not available
    const contact = user?.mobile && user.mobile.length === 10 ? user.mobile : '9999999999';
    const name = user?.name || 'Guest User';
    const token = user?.token || '';
    const heartCount = parseInt(heartsInput);

    const options = {
      description: 'Purchase Hearts',
      image: '../assets/images/logo.png',
      currency: 'INR',
      key: 'rzp_test_w28BE16AqeUdvf', // Replace with live key
      amount: (parseFloat(calculatedPrice) * 100).toFixed(0),
      name: 'Timble App',
      prefill: { email, contact, name },
      theme: { color: '#FF1744' },
      method: {
        netbanking: true,
        card: true,
        upi: true,
        wallet: false,
        paylater: false,
        emi: false,
      },
    };

    RazorpayCheckout.open(options)
      .then(async (data) => {
        const res = await fetch('https://webtechnomind.in/project/timble/api/heart/store', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            heart_count: heartCount,
            transaction_id: data.razorpay_payment_id,
            payment_status: 'success',
          }),
        });

        const result = await res.json();

        if (result.success === true) {
          navigation.navigate('SuccessPayment');
        } else {
          Alert.alert("Server Error", "Hearts were not added. Please contact support.");
        }
      })
      .catch(() => {
        navigation.navigate('FailedPayment');
      });
  } catch (err) {
    console.error('Payment Error', err);
    Alert.alert('Error', 'Could not proceed to payment.');
  }
};


  const quickAmounts = [50, 100, 500, 1000, 2000, 5000];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={wp(6)} color="#000" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Heart Calculator</Text>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: hp(2) }}>
            {/* <Image source={require('../assets/images/like.png')} style={{ width: wp('8%'), height: hp('3%'), resizeMode: 'contain' }} /> */}
            <Text style={styles.sectionTitle}> Enter Heart Amount</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.heartsInput}
              value={heartsInput}
              onChangeText={setHeartsInput}
              placeholder="Enter hearts amount"
              keyboardType="numeric"
              maxLength={8}
            />
            <Text style={styles.heartsLabel}>Hearts</Text>
          </View>

          {/* Quick Select Buttons */}
          <View style={styles.quickSelectContainer}>
            <Text style={styles.quickSelectTitle}>Quick Select:</Text>
            <View style={styles.quickButtonsRow}>
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickButton,
                    { backgroundColor: heartsInput === amount.toString() ? '#FF69B4' : '#F0F0F0' },
                  ]}
                  onPress={() => setHeartsInput(amount.toString())}
                >
                  <Text
                    style={[
                      styles.quickButtonText,
                      { color: heartsInput === amount.toString() ? '#FFF' : '#333' },
                    ]}
                  >
                    {amount >= 1000 ? `${amount / 1000}K` : amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Pay Now Button */}
        {calculatedPrice && (
          <TouchableOpacity style={[styles.buyButton, { backgroundColor: '#FFCA30' }]} onPress={handlePayment}>
            <Icon name="card" size={wp(5)} color="#FFF" />
            <Text style={styles.buyButtonText}>Pay Now ₹{calculatedPrice}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: wp('5%'), paddingVertical: hp('4%'), backgroundColor: '#FFF',
    marginTop: hp('2%'),
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: wp('5%'), color: '#000', marginLeft: wp(1) },
  placeholder: { width: wp(15) },
  content: { flex: 1, paddingHorizontal: wp(5) },
  headerTitle: { fontSize: wp(5.8), fontWeight: '700', color: '#000', marginVertical: 0 },
  inputSection: {
    backgroundColor: '#FFF', borderRadius: wp(4), padding: wp(5), marginVertical: hp(2),
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 3,
  },
  sectionTitle: { fontSize: wp(4.5), fontWeight: '700', color: '#333', marginBottom: hp(2) },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA',
    borderRadius: wp(3), paddingHorizontal: wp(4), borderWidth: 2, borderColor: '#E9ECEF',
  },
  heartsInput: { flex: 1, fontSize: wp(5), fontWeight: '600', color: '#333', paddingVertical: hp(1.5) },
  heartsLabel: { fontSize: wp(4), color: '#666', fontWeight: '500' },
  quickSelectContainer: { marginTop: hp(2) },
  quickSelectTitle: { fontSize: wp(3.5), color: '#666', marginBottom: hp(1) },
  quickButtonsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(2) },
  quickButton: {
    paddingHorizontal: wp(4), paddingVertical: hp(1), borderRadius: wp(3),
    minWidth: wp(15), alignItems: 'center',
  },
  quickButtonText: { fontSize: wp(3.5), fontWeight: '600' },
  buyButton: {
    borderRadius: wp(4), paddingVertical: hp(2), flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginVertical: hp(2),
  },
  buyButtonText: { color: '#FFF', fontSize: wp(4.2), fontWeight: '700', marginHorizontal: wp(3) },
});

export default CalculateScreen;
