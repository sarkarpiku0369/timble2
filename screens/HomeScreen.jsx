import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  StatusBar,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_ENDPOINTS from '../apiConfig';
import {widthPercentageToDP as wp, heightPercentageToDP as hp,} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import SharePage from '../components/SharePage';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageIndices, setImageIndices] = useState({}); // Track image indices for all cards
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
          const profilesData = result?.data || [];
          setProfiles(profilesData);
          
          // Initialize image indices for all profiles
          const initialIndices = {};
          profilesData.forEach((profile, index) => {
            initialIndices[profile.id] = 0;
          });
          setImageIndices(initialIndices);
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

  const forceSwipe = (direction, profileId) => {
    const likedProfile = profiles[currentIndex];
    const clickProfileID = likedProfile?.id;
    const finalProfileId = profileId ? clickProfileID : clickProfileID;
    if(direction === 'right'){
      //like
      handleLike(finalProfileId);
    }else{
      //nope
      handleReject(finalProfileId);
    }
    const x = direction === 'right' ? wp('120%') : -wp('120%');
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

  //like
  const handleLike = async (index) => {
    try {
      const stored = await AsyncStorage.getItem('userData');
      const user = JSON.parse(stored || '{}');
      const token = user.token || '';
      // POST liked user ID to API
      const response = await fetch(API_ENDPOINTS.LIKE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          liked_user_id: index,
        }),
      });

      const resData = await response.json();
      console.log('Like response:', resData);
    } catch (error) {
      console.error('Error liking user:', error);
    }
  };

  //Reject
  const handleReject = async (index) => {
    try {
      const stored = await AsyncStorage.getItem('userData');
      const user = JSON.parse(stored || '{}');
      const token = user.token || '';

      // POST rejected user ID to API
      const response = await fetch(API_ENDPOINTS.UNLIKE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          liked_user_id: index,
        }),
      });

      const resData = await response.json();
      console.log('Reject response:', resData);
    } catch (error) {
      console.error('Error rejecting user:', error);
    }

    // Animate and go to next card
  };

  const handleImageScroll = (profileId, newIndex) => {
    setImageIndices(prev => ({
      ...prev,
      [profileId]: newIndex
    }));
  };

  // Handle image navigation by tapping on dots
  const handleDotPress = (profileId, dotIndex) => {
    setImageIndices(prev => ({
      ...prev,
      [profileId]: dotIndex
    }));
  };

  // Handle tap navigation for images
  const handleImageNavigation = (profileId, direction) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    
    const galleryImages = profile.gallery && profile.gallery.length > 0 ? profile.gallery : [profile.profile_pic];
    const currentIndex = imageIndices[profileId] || 0;
    let newIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex < galleryImages.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : galleryImages.length - 1;
    }
    
    setImageIndices(prev => ({
      ...prev,
      [profileId]: newIndex
    }));
  };

  const renderCards = () => {
    if (currentIndex >= profiles.length) {
      return (
        <View style={styles.card}>
          <Text style={styles.doneText}>That's everyone!</Text>
          <TouchableOpacity onPress={() => setCurrentIndex(0)} style={styles.resetBtn}>
            <Text style={styles.resetBtnText}>Start Over</Text>
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
            top: hp() * (index - currentIndex),
            zIndex: 5,
          };

      const currentProfileId = profile.id;
      const currentImgIndex = imageIndices[currentProfileId] || 0;

      const panResponderWithId = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => {
          // Only set pan responder if there's significant movement (swipe)
          return Math.abs(gesture.dx) > 10 || Math.abs(gesture.dy) > 10;
        },
        onPanResponderMove: (_, gesture) => {
          position.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > wp('30%')) {
            forceSwipe('right', currentProfileId);
          } else if (gesture.dx < -wp('30%')) {
            forceSwipe('left', currentProfileId);
          } else {
            resetPosition();
          }
        },
      });

      return (
        <Animated.View
          key={profile.id}
          {...(isTopCard ? panResponderWithId.panHandlers : {})}
          style={[styles.card, animatedStyle, isTopCard && styles.absolutePosition]}
        >
          {/* 🔹 Current Image Display */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ 
                uri: (profile.gallery && profile.gallery.length > 0 
                  ? profile.gallery[currentImgIndex] 
                  : profile.profile_pic) 
              }} 
              style={styles.image} 
            />
            
            {/* 🔹 Touch zones for image navigation (only for top card) */}
            {isTopCard && (
              <>
                <TouchableOpacity
                  style={styles.leftTouchZone}
                  onPress={() => handleImageNavigation(currentProfileId, 'prev')}
                  activeOpacity={1}
                />
                <TouchableOpacity
                  style={styles.rightTouchZone}
                  onPress={() => handleImageNavigation(currentProfileId, 'next')}
                  activeOpacity={1}
                />
              </>
            )}
          </View>

          {/* 🔹 Dots Indicator - Now clickable for image navigation */}
          <View style={styles.dotsContainer}>
            {(profile.gallery && profile.gallery.length > 0 ? profile.gallery : [profile.profile_pic]).map(
              (_, dotIdx) => (
                <TouchableOpacity
                  key={dotIdx}
                  onPress={() => handleDotPress(currentProfileId, dotIdx)}
                  style={[
                    styles.dot,
                    dotIdx === currentImgIndex ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              )
            )}
          </View>

          {/* Gradient & swipe indicators (LIKE/NOPE) */}
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
                <Image source={require('../assets/images/like.png')} style={styles.overlayText} />
              </Animated.View>
              <Animated.View style={[styles.nope, { opacity: nopeOpacity }]}>
                <Image source={require('../assets/images/nope.png')} style={styles.overlayText} />
              </Animated.View>
            </>
          )}

          {/* Info Section */}
          <View style={styles.info}>
            {/* <TouchableOpacity
            > */}
              <Text style={styles.name}>
                {profile.name}, {profile.age}
              </Text>
            {/* </TouchableOpacity> */}
            
            <View style={styles.flexHomeMain}>
              <View style={styles.homeFlex}>
                <Image
                  source={require('../assets/images/home.png')}
                  style={styles.group}
                /> 
                <Text style={styles.address}>{profile.location}</Text>
              </View>
              <View style={styles.homeFlex}> 
                <Image
                  source={require('../assets/images/loco.png')}
                  style={styles.group}
                /> 
                <Text style={styles.address}>{profile.distance}</Text>
              </View>
              <SharePage profile={profile.id} />
              {/* <Image 
                source={require('../assets/images/share.png')} 
                style={styles.share}
              /> */}
              <TouchableOpacity 
                onPress={() =>
                  navigation.navigate('AuthFlow', {
                    screen: 'Profile Details',
                    params: { id: profile.id },
                  })
                }
              >
                <Image 
                  source={require('../assets/images/profile.png')} 
                  style={styles.share}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      );
    })
    .reverse();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content"/>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/home-logo.png')}
          style={styles.heartIcon} 
        />
      </View>
      <View style={styles.cardContainer}>{renderCards()}</View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => forceSwipe('left')} style={styles.actionBtn}>
          <View style={styles.buttonCircle}>
            <Image 
              source={require('../assets/images/nope-btn.webp')} 
              style={styles.rejectIcon}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => forceSwipe('right')} style={styles.mainActionBtn}>
          <View style={styles.buttonCircle}>
            <Image 
              source={require('../assets/images/like-btn.webp')} 
              style={styles.likeIcon} 
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => {
            const currentProfile = profiles[currentIndex];
            if (!currentProfile) return;

            navigation.navigate("AuthFlow", {
              screen: "Chat Details",
              params: {
                contact: {
                  id: currentProfile.id,
                  name: currentProfile.name,
                  avatar: currentProfile.image,
                  // isVerified: currentProfile.is_verified // uncomment if needed
                }
              }
            });
          }}
        >
          <View style={styles.buttonCircle}>
            <Image 
              source={require('../assets/images/chat-btn.webp')} 
              style={styles.superLikeIconButton}
            />
          </View>
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
  },
  loadingContainer: {
    justifyContent: 'center',
  },
  logoContainer: {
    marginTop: hp('2%'),
  },
  address: {
    fontWeight: '500',
    fontSize: wp('3.8%')
  },
  flexHomeMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 16
  },
  homeFlex: {
    flexDirection: 'row',
    gap: 6
  },
  heartIcon: {
    width: wp('40%'),
    height: wp('16%'),
    resizeMode: 'contain',
  },
  cardContainer: {
    width: wp('90%'),
    height: hp('65%'),
    position: 'relative',
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: wp('5%'),
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  absolutePosition: {
    position: 'absolute',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  leftTouchZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '50%',
    height: '70%', // Cover most of the image area, excluding bottom info section
    zIndex: 15,
  },
  rightTouchZone: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '50%',
    height: '70%', // Cover most of the image area, excluding bottom info section
    zIndex: 15,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    height: '40%',
    width: '100%',
  },
  info: {
    position: 'absolute',
    bottom: hp('0.1%'),
    left: wp('4%'),
    right: wp('4%'),
  },
  name: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    color: '#000',
  },
  bio: {
    fontSize: wp('4%'),
    color: '#333',
    marginTop: hp('0.5%'),
  },
  distance: {
    fontSize: wp('3.5%'),
    color: '#888',
    marginTop: hp('0.3%'),
  },
  group: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  share: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
  like: {
    position: 'absolute',
    top: hp('6%'),
    left: wp('6%'),
    width: wp('50%'),
    height: wp('50%'),
  },
  nope: {
    position: 'absolute',
    top: hp('6%'),
    right: wp('6%'),
    width: wp('50%'),
    height: wp('50%'),
  },
  overlayText: {
    width: "100%",
    height: '100%',
    resizeMode: 'contain',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: wp('80%'),
    marginTop: hp('5%'),
  },
  actionBtn: {
    width: wp('14%'),
    height: wp('14%'),
    backgroundColor: '#fff',
    borderRadius: wp('9%'),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  mainActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    marginTop: hp('10%'),
  },
  resetBtn: {
    marginTop: hp('2%'),
    backgroundColor: '#ec4899',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('6%'),
    alignSelf: 'center',
  },
  resetBtnText: {
    color: 'white', 
    fontWeight: 'bold',
  },
  buttonCircle: {
    width: wp('17%'),
    height: wp('17%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  superLikeIconButton: {
    width:"100%",
    resizeMode: "contain"
  },
  likeIcon: {
    width:"100%",
    resizeMode: "contain"
  },
  rejectIcon: {
    width:"100%",
    resizeMode: "contain"
  },
  //new - Updated dots to be clickable
  dotsContainer: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    zIndex: 20,
  },
  dot: {
    width: 40,
    height: 3.5,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#F93CA6',
  },
  inactiveDot: {
    backgroundColor: '#fff',
  },
});

export default HomeScreen;