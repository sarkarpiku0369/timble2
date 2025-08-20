import React, { useState, useEffect } from 'react';
import {
  ImageBackground,
  View,
  Text,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SIZES } from '../constants/StyleConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomNavComponent from '../components/bottonCommon';
import Slider from '@react-native-community/slider';
import Geolocation from '@react-native-community/geolocation'; // Fixed import
import { apiGet, apiPost } from '../utils/api';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import CommonHeader from '../components/CommonHeader';

const LocationScreen = ({ navigation }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [distance, setDistance] = useState(52);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchLikesMe();
    getLocation();
      // Set interval to update location every 15 minutes
    const interval = setInterval(() => {
      //console.log('⏰ Running scheduled location update...');
      getLocation(); // This fetches and saves the current location
    }, 1 * 60 * 1000); // 15 minutes in milliseconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);
  const fetchLikesMe = async () => {
    try {
      const res = await apiGet('distance-preference');
      setUsers(res?.data || []);
    } catch (error) {
      console.log('Error:', error);
    }
  };
  // FIXED: Proper Geolocation implementation
  const getLocation = async () => {
    try {
      // Check location permission first
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      
      const permissionStatus = await check(permission);
      
      if (permissionStatus !== RESULTS.GRANTED) {
        // Alert.alert(
        //   'Location Permission Required',
        //   'Please enable location permissions in settings',
        //   [{ text: 'OK' }]
        // );
        return;
      }
      setIsFetchingLocation(true);
      // Use proper Geolocation API
      Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        saveLocation(latitude, longitude);
        setIsFetchingLocation(false);
      },
      (error) => {
        setIsFetchingLocation(false);
        Alert.alert(
          'Location Error',
          `Failed to get location: ${error.message}`,
          [{ text: 'OK' }]
        );
      },
      {
        enableHighAccuracy: false, // change to false for quicker response
        timeout: 30000,             // increase timeout to 30 seconds
        maximumAge: 10000
      }
    );

    } catch (error) {
      setIsFetchingLocation(false);
      console.error('Location error:', error);
    }
  };

  const saveLocation = async (latitude, longitude) => {
  try {
    const body = {
      lat: latitude,
      lon: longitude,
    };
    const res = await apiPost('update/profile', body);
  } catch (e) {
    console.log('Error:', e);
  }
};

const handleFetchPerson = async (value) => {
  setDistance(Math.round(value));
  setUsers([]);
  fetchLikesMe();
};


const renderItem = ({ item }) => (
  <TouchableOpacity 
  onPress={() =>
                navigation.navigate('AuthFlow', {
                  screen: 'Profile Details',
                  params: { id: item.id },
                })
              }
    // onPress={() => navigation.navigate('AuthFlow', { screen: 'Profile Details' })}
    style={styles.cardContainer} // Add container style
  >
    <View style={styles.card}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.image}
        imageStyle={styles.imageRadius}
      >
        <LinearGradient
          colors={['transparent', '#9F075C']}
          style={styles.gradient}
        >
          <View style={styles.infoContainer}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={styles.locationContainer}>
              <Icon name="location-on" size={wp(3)} color="#fff" />
              <Text style={styles.location} numberOfLines={1}>{item.location}</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  </TouchableOpacity>
);

 return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content"/>
      
      {/* Header */}
      {/* <View style={styles.header}>
        <Image
          source={require('../assets/images/timble_logo_label.png')}
          style={styles.logo}

        />
        
        <TouchableOpacity 
          onPress={getLocation}
          style={styles.locationButton}
        >
          {isFetchingLocation ? (
            <ActivityIndicator size="small" color="#FF69B4" />
          ) : currentLocation ? (
            <Icon name="check-circle" size={wp(5)} color="#4CAF50" />
          ) : (
            <Icon name="gps-fixed" size={wp(5)} color="#FF69B4" />
          )}
        </TouchableOpacity>
      </View> */}
      <CommonHeader/>
      
      {/* Distance Preference Section */}
      <View style={styles.preferenceContainer}>
        <Text style={styles.preferenceTitle}>Distance Preference</Text>
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceValue}>{distance} km</Text>
        </View>
      </View>
      
      <View style={{ marginHorizontal: 38, justifyContent: 'center' }}>

      <Slider
  style={{ width: '100%', height: 40 }}
  minimumValue={0}
  maximumValue={100}
  value={distance}
  minimumTrackTintColor="#F93CA6"
  maximumTrackTintColor="#eee"
  thumbTintColor="#F93CA6"
  thumbStyle={styles.sliderThumb}
   onValueChange={(value) => setDistance(Math.round(value))} // updates text live
  onSlidingComplete={handleFetchPerson} // Changed from onValueChange
/>
      </View>
      
      <View style={styles.divider} />
      
      {/* User List */}
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      
      <BottomNavComponent navigation={navigation} tabName="LikesScreen" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    cardContainer: {
    // width: wp("33.33%"), 
    aspectRatio: 3/4, // This gives a nice card proportion (width:height = 3:4)
    // padding: wp('1%'),
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: hp(1),
    paddingBottom: hp(1.5),
  },
  logo: {
  width: 76,
    height: 51,
  },
  locationButton: {
    padding: wp(2),
  },
  preferenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(15),
     backgroundColor: '#fff',
  },
  preferenceTitle: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#000',
     backgroundColor: '#fff',
  },
  distanceContainer: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    // paddingVertical: hp(0.5),
  },
  distanceValue: {
    fontSize: wp(4),
    color: '#F93CA6',
    fontWeight: '700',
  },
  slider: {
    width: '90%',
    height: hp(1),
    alignSelf: 'center',
    marginVertical: hp(1),
     backgroundColor: '#F8F9FA',
     paddingHorizontal: wp(16)
  },
  sliderThumb: {
    width: wp(5),
    height: wp(5),
    borderRadius: wp(2.5),
     backgroundColor: '#F8F9FA',
  },
  divider: {
    width: '90%',
    height: hp(0.1),
    backgroundColor: '#F8F9FA',
    alignSelf: 'center',
    marginVertical: hp(1),
  },
  list: {
    paddingBottom: hp(10),
    paddingTop: hp(1),
     backgroundColor: '#F8F9FA',
  },
  card: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: wp('1%'),
    width: wp("31%"),
    height: "100%",
    // margin: wp(1.5),
    borderRadius: wp(4),
    overflow: 'hidden',
    paddingVertical: wp('1%')
    // padding: wp('1%'),
   
    // elevation: 3,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
   
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
   
  },
  imageRadius: {
    borderRadius: wp(4),
  },
  gradient: {
    // height: '40%',
    justifyContent: 'flex-end',
  },
  infoContainer: {
    padding: wp(3),
  },
  name: {
    color: '#fff',
    fontSize: wp(3.8),
    fontWeight: '700',
    marginBottom: hp(0.5),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    color: '#fff',
    fontSize: wp(3.2),
    fontWeight: '500',
    marginLeft: wp(1),
    flexShrink: 1,
  },
});

export default LocationScreen;