import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_ENDPOINTS from '../apiConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {widthPercentageToDP as wp, heightPercentageToDP as hp,} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';

const SwipeCards = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  //get data
  useEffect(() => {
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('userData');
      if (stored) {
        const user = JSON.parse(stored);
        const token = user.token || '';

        const response = await fetch(API_ENDPOINTS.HOME_API_DATA, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        setProfiles(result?.data || []);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchProfiles();
}, []);


  const rotate = position.x.interpolate({
    inputRange: [-wp('100%'), 0, wp('100%')],
    outputRange: ['-20deg', '0deg', '20deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, wp('25%')],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-wp('25%'), 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        console.log('12');
        if (gesture.dx > wp('30%')) {
          forceSwipe('right');
        } else if (gesture.dx < -wp('30%')) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction) => {
    const x = direction === 'right' ? wp('120%') : -wp('120%');
    console.log('direction',direction);
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex((prev) => prev + 1);
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start();
  };

  const undoSwipe = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const renderCards = () => {
    if (currentIndex >= profiles.length) {
      return (
        <View style={styles.card}>
          <Text style={styles.doneText}>That's everyone!</Text>
          <TouchableOpacity onPress={() => setCurrentIndex(0)} style={styles.resetBtn}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Start Over</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return profiles.map((profile, index) => {
        if (index < currentIndex) return null;

        const isTopCard = index === currentIndex;
        const animatedStyle = isTopCard
          ? {
              transform: [...position.getTranslateTransform(), { rotate }],
              zIndex: 10,
            }
          : {
              //top: hp('1%') * (index - currentIndex),
              top: hp() * (index - currentIndex),
              zIndex: 5,
            };

        return (
          <Animated.View
            key={profile.id}
            {...(isTopCard ? panResponder.panHandlers : {})}
            style={[styles.card, animatedStyle, isTopCard && { position: 'absolute' }]}
          >
            <Image source={{ uri: profile.image }} style={styles.image} />
            <LinearGradient
                colors={['rgba(255, 255, 255, 0)', 'rgba(255, 202, 48, 1)']}
                locations={[0, 0.77]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.gradientOverlay}
              />
            {isTopCard && (
              <>
                <Animated.View style={[styles.like, { opacity: likeOpacity }]}>
                  {/* <Text style={styles.overlayText}>LIKE</Text> */}
                  <Image
                  source={require('../assets/images/like.png')}
                  style={styles.overlayText}
                />
                </Animated.View>
                <Animated.View style={[styles.nope, { opacity: nopeOpacity }]}>
                 {/*<Text style={styles.overlayText}>NOPE</Text>*/}
                   <Image
                  source={require('../assets/images/nope.png')}
                  style={styles.overlayText}
                />
                </Animated.View>
              </>
            )}
            <View style={styles.info}>
              <Text style={styles.name}>
                {profile.name}, {profile.age}
              </Text>
              <Text style={styles.bio}>{profile.bio}</Text>
              <Text style={styles.distance}>{profile.distance}</Text>
            </View>
          </Animated.View>
        );
      })
      .reverse();
  };

  return (
    
    <View style={styles.container}>
    <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/home-logo.png')}
            style={styles.heartIcon} 
          />
        </View>
      <View style={styles.cardContainer}>{renderCards()}</View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={undoSwipe} style={styles.actionBtn}>
          <MaterialIcons name="restore" size={wp('6%')} color="#fbbf24" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => forceSwipe('left')} style={styles.actionBtn}>
          <Ionicons name="close" size={wp('8%')} color="#ef4444" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => forceSwipe('right')} style={styles.mainActionBtn}>
          <Ionicons name="heart" size={wp('9%')} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <FontAwesome name="star" size={wp('7%')} color="#3b82f6" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFCA30',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  logoContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    //marginBottom: 7 
  },
  gradientOverlay: { 
    position: 'absolute', 
    bottom: 0, 
    height: "40%", 
    left: 0, 
    right: 0 
  },
  heartIcon: { 
    fontSize: 24, 
    color: '#FF4458', 
    marginRight: 5 
  },
  cardContainer: {
    width: wp('95%'),
    height: hp('65%'),
    
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    position: 'absolute',
    overflow: 'hidden',
    //elevation: 6,
    
  },
  image: {
    width:wp('90%'),
    height: hp('55%'),
  },
  info: {
    padding: wp('4%'),
  },
  name: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
  },
  bio: {
    color: '#555',
    marginTop: hp('0.5%'),
    fontSize: wp('4%'),
  },
  distance: {
    color: '#999',
    marginTop: hp('0.3%'),
    fontSize: wp('3.5%'),
  },
  like: {
    position: 'absolute',
    top: hp('5%'),
    left: wp('5%'),
    //backgroundColor: 'green',
    padding: wp('2%'),
    borderRadius: wp('2%'),
  },
  nope: {
    position: 'absolute',
    top: hp('5%'),
    right: wp('5%'),
    //backgroundColor: 'red',
    padding: wp('2%'),
    borderRadius: wp('2%'),
  },
  overlayText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp('4%'),
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: hp('3%'),
    justifyContent: 'space-between',
    width: wp('80%'),
    top:wp('2%'),
  },
  actionBtn: {
    width: wp('14%'),
    height: wp('14%'),
    backgroundColor: '#fff',
    borderRadius: wp('7%'),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    
  },
  mainActionBtn: {
    width: wp('18%'),
    height: wp('18%'),
    backgroundColor: '#ec4899',
    borderRadius: wp('9%'),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  doneText: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: hp('10%'),
  },
  resetBtn: {
    marginTop: hp('2%'),
    backgroundColor: '#ec4899',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('6%'),
  },
});

export default SwipeCards;
