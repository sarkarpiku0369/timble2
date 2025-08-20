
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
//import { useRoute } from "@react-navigation/native";

//global functions
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_ENDPOINTS from '../apiConfig';
const ProfileDetails = ({ route }) => {
    //const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params;
    console.log("Profile ID:",id);
    const [profile, setProfile] = useState(null);
       const [interests, setInterest] = useState(null);
    const [loading, setLoading] = useState(true); 
  const [images, setImage] = useState([]);

    
    const hobbies = ['Hiking', 'Photography', 'Food', 'Travel', 'Technology', 'Art'];
  
  // Sample images array - replace with actual profile images
  // const images = [
  //   'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face',
  //   'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face',
  //   'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face',
  //   'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face',
  //   'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face',
  // ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageCarouselRef = useRef(null);
  
  const handleImageTap = (event) => {
    const tapX = event.nativeEvent.locationX;
    const imageWidth = wp('100%');
    const tapZone = imageWidth / 3;
    
    if (tapX < tapZone) {
      // Tapped on left side - go to previous image
      goToPreviousImage();
    } else if (tapX > imageWidth - tapZone) {
      // Tapped on right side - go to next image
      goToNextImage();
    }
  };
  
  const goToNextImage = () => {
    const nextIndex = (currentImageIndex + 1) % images.length;
    setCurrentImageIndex(nextIndex);
    imageCarouselRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
  };
  
  const goToPreviousImage = () => {
    const prevIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(prevIndex);
    imageCarouselRef.current?.scrollToIndex({
      index: prevIndex,
      animated: true,
    });
  };
  
  const onImageScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  const renderProgressBar = () => {
    if (!images || images.length === 0) return null; // nothing to render

    return (
      <View style={styles.progressContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressBar,
              index === currentImageIndex && styles.progressActive,
            ]}
          />
        ))}
      </View>
    );
  };
  
  const renderImageItem = ({ item }) => (
    <TouchableWithoutFeedback onPress={handleImageTap}>
      <Image source={{ uri: item }} style={styles.profileImage} />
    </TouchableWithoutFeedback>
  );

  const renderHobbyTag = (hobby) => (
    <View key={hobby} style={styles.hobbyTag}>
      <Text style={styles.hobbyText}>{hobby}</Text>
    </View>
  );

  const renderDivider = () => <View style={styles.divider} />;


useEffect(() => {
  const fetchProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem('userData');
      const user = JSON.parse(stored || '{}');
      const token = user?.token || '';
      console.log("Token2:", token);

      if (!token) {
        console.warn("⚠️ No token found in AsyncStorage");
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.GET_USER_DETAILS}/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const result = await response.json();
      console.log("API raw response:", result);

      if (result.success) {
        setProfile(result.data);
        setInterest(result.data.interests || []); // Set interests if available
        setImage(result.data.images);
        setLoading(false);
        console.log("Profile Images:", result.data.images);
      } else {
        console.warn("⚠️ API returned error:", result.message || result);
      }
    } catch (error) {
      console.error('❌ Error fetching personal details:', error);
    }
  };
  fetchProfile();
}, [id]);

if(loading) {
  return (
     <ActivityIndicator size="large" color="#F93CA6" style={{ marginTop: 20 }} />
  );
}


  return (
    <View style={styles.container}>
      {/* Header with Profile Images Carousel */}
      <View style={styles.headerContainer}>
        <FlatList
          ref={imageCarouselRef}
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onImageScroll}
          style={styles.imageCarousel}
        />
        
        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />
        
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        
        {/* Name and Age */}
        <View style={styles.nameContainer}>
          <View style={styles.nameRow}>
            {profile.fullname && (
                <Text style={styles.nameText}>{profile.fullname || "name"}, {profile.age || "age"}</Text>
            )}
          
            <View style={styles.verificationBadge}>
              <Ionicons name="checkmark" size={12} color="white" />
            </View>
          </View>
        </View>
        
        {/* Progress Bar */}
        {renderProgressBar()}
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* About Section */}
        <View style={styles.section}>
           {profile.fullname && (
            <>
             <Text style={styles.sectionTitle}>About {profile.fullname || "name"}</Text>
          <Text style={styles.sectionText}>
           {profile.about_me || "about me"}
          </Text>
            </>
           )}
         
        </View>

        {renderDivider()}

        {/* Looking For Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Looking for</Text>
          <View style={styles.lookingForRow}>
            <Text style={styles.sectionText}>Long-term partner</Text>
            <Ionicons name="heart" size={16} color="#EC4899" />
          </View>
        </View>

        {renderDivider()}

        {/* Hobbies Section */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hobbies</Text>
          <View style={styles.hobbiesContainer}>
            {hobbies.map(renderHobbyTag)}
          </View>
        </View> */}
        {interests.map((hobby) => (
    <View key={hobby.id} style={styles.hobbyGroup}>
      {/* Hobby Name */}
      <Text style={styles.sectionTitle}>{hobby.name}</Text>

      {/* Hobby Details */}
      <View style={styles.hobbiesContainer}>
        {hobby.details.map((detail) => (
          <Text key={detail.id} style={styles.hobbyTag}>
            {detail.title}
          </Text>
        ))}
      </View>
    </View>
  ))}

        {/* Essentials Section */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Essentials</Text>
          <View style={styles.essentialsContainer}>
            <Text style={styles.sectionText}>6 Km away</Text>
            {renderDivider()}
            <Text style={styles.sectionText}>Hindi, English, Bengali</Text>
            {renderDivider()}
            <Text style={styles.sectionText}>163cm</Text>
            {renderDivider()}
            <Text style={styles.sectionText}>She/Her/Hers</Text>
          </View>
        </View>

        {renderDivider()} */}

        {/* Lifestyle Section */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifestyle</Text>
          <View style={styles.lifestyleContainer}>
            <View style={styles.lifestyleItem}>
              <Text style={styles.lifestyleLabel}>Pets</Text>
              <Text style={styles.sectionText}>Want a pet</Text>
            </View>
            {renderDivider()}
            <View style={styles.lifestyleItem}>
              <Text style={styles.lifestyleLabel}>Drinking</Text>
              <Text style={styles.sectionText}>On special occasions</Text>
            </View>
            {renderDivider()}
            <View style={styles.lifestyleItem}>
              <Text style={styles.lifestyleLabel}>Smoking</Text>
              <Text style={styles.sectionText}>Non Smoker</Text>
            </View>
          </View>
        </View> */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: hp('3%'),
  },
  headerContainer: {
    position: 'relative',
    height: hp('50%'),
  },
  profileImage: {
    width: wp('100%'),
    height: hp('50%'),
    resizeMode: 'cover',
  },
  imageCarousel: {
    height: hp('50%'),
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp('10%'),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backButton: {
    position: 'absolute',
    top: hp('6%'),
    left: wp('4%'),
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    position: 'absolute',
    bottom: hp('5%'),
    left: wp('4%'),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: 'white',
    marginRight: wp('2%'),
  },
  verificationBadge: {
    width: wp('6%'),
    height: wp('6%'),
    borderRadius: wp('3%'),
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: hp('2%'),
    left: wp('4%'),
    right: wp('4%'),
    flexDirection: 'row',
    gap: wp('1%'),
  },
  progressBar: {
    flex: 1,
    height: hp('0.5%'),
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: hp('0.25%'),
  },
  progressActive: {
    backgroundColor: '#EC4899',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('4%'),
  },
  section: {
    paddingVertical: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: hp('1.5%'),
  },
  sectionText: {
    fontSize: wp('4%'),
    color: '#6B7280',
    lineHeight: hp('2.8%'),
  },
  lookingForRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp('2%'),
    marginTop: hp('1%'),
  },
  hobbyTag: {
    backgroundColor: '#FCD34D',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('5%'),
  },
  hobbyText: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
    color: '#000',
  },
  essentialsContainer: {
    marginTop: hp('1%'),
  },
  lifestyleContainer: {
    marginTop: hp('1%'),
  },
  lifestyleItem: {
    paddingVertical: hp('1%'),
  },
  lifestyleLabel: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: hp('0.5%'),
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: hp('1%'),
  },
});

export default ProfileDetails;