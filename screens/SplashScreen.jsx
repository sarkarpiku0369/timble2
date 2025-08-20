import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const SplashScreen = ({ navigation }) => {


    useEffect(() => {
    const checkFlow = async () => {
      try {
        const permissionsGranted = await AsyncStorage.getItem('permissionsGranted');
        const userData = await AsyncStorage.getItem('userData');

        setTimeout(() => {
          if (!permissionsGranted) {
            // 👈 go to permissions only if not granted before
            navigation.replace('Permissions');
          } else if (userData) {
            navigation.replace('MainApp');
          } else {
            navigation.replace('Welcome');
          }
        }, 3000);
      } catch (error) {
        console.error('Error checking app flow:', error);
        navigation.replace('Welcome');
      }
    };

    checkFlow();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/flash.png')}
        style={styles.backgroundImage}
      />
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: wp('100%'),
    height: hp('100%'),
    resizeMode: 'cover',
  },
  logo: {
    width: wp('60%'),
    height: wp('60%'),
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: hp('35%'),
  },
});

export default SplashScreen;
