
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { COLORS, SIZES } from '../constants/StyleConfig';
import Header from '../components/header';

const FaceVerifyScreen = ({navigation}) => {
  return (
    <ImageBackground
      source={require('../assets/images/faceverify_background.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      {/* <StatusBar barStyle="dark-content" /> */}
      <Header navigation={() => navigation.navigate('Permission')} leftLeble="Skip" leftAction={() => navigation.navigate('Permissions')} />
      <View style={styles.overlay}>
       
        <Image
          source={require('../assets/images/faceverify_scan.png')} 
          style={styles.faceMesh}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          Face <Text style={styles.highlight}>verify</Text>
        </Text>

        <Text style={styles.description}>
          Face verification is a specific application of face recognition that involves comparing two facial images to determine if they belong to the user
        </Text>

        <TouchableOpacity onPress={() => navigation.navigate('AuthFlow', { screen: 'FaceCapture' })} style={styles.button}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  faceMesh: {
    position: 'absolute',
    top: 30,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 10,
  },
  highlight: {
    color: COLORS.secondary,
  },
  description: {
    textAlign: 'center',
    fontSize: 12,
    paddingHorizontal: 30,
    marginBottom: 30,
    paddingHorizontal: 10,
    lineHeight: 20,
    marginHorizontal: 20,
  },
  button: {
    backgroundColor: '#F93CA6',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: SIZES.h4,
  },
});

export default FaceVerifyScreen;

