// EditProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SIZES, FONTS, COLORS } from "../constants/StyleConfig";
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

import {widthPercentageToDP as wp,heightPercentageToDP as hp,} from 'react-native-responsive-screen';
import AboutAddModal from '../components/AboutAddModal';
//import InterestModal from '../components/InterestModal';
//global
import { GlobalToast } from '../utils/GlobalToast'; // Adjust the import path as needed
import API_ENDPOINTS from '../apiConfig';
import GlobalModal from '../components/GlobalModal';
const MAX_PHOTOS = 6;

const EditProfileScreen = ({ navigation }) => {
  const [photos, setPhotos] = useState([]);
  const [about, setAbout] = useState('');
//  const [interest, setInterest] = useState('');
  //const [weekend, setWeekend] = useState('');
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  //const [interestModalVisible, setInterestModalVisible] = useState(false);
//  const [weekendModalVisible, setWeekendModalVisible] = useState(false);
  //const [interestCategories, setInterestCategories] = useState([]);
  //const [selectedSlot, setSelectedSlot] = useState(null);
  const [uploadingIndex, setUploadingIndex] = useState(null); // Track which image is uploading
  //global
  // Relationship Goals
  const [relationshipGoals, setRelationshipGoals] = useState("");
  const [relationshipGoalsVisible, setRelationshipGoalsVisible] = useState(false);
  // Relationship Type
  const [relationshipType, setRelationshipType] = useState("");
  const [relationshipTypeVisible, setRelationshipTypeVisible] = useState(false);
  // Languages
  const [languages, setLanguages] = useState("");
  const [languagesVisible, setLanguagesVisible] = useState(false);
  // Weekend Getaway
  const [weekend, setWeekend] = useState("");
  const [weekendVisible, setWeekendVisible] = useState(false);
  // Basics
  const [basics, setBasics] = useState("");
  const [basicsVisible, setBasicsVisible] = useState(false);
  useEffect(() => {
    fetchUploadedPhotos();
  }, []);

  const handleAddPhoto = async (slotIndex = null) => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
      });

      if (!result.didCancel && result.assets?.length) {
        const selectedImage = result.assets[0];
        
        // Immediately update UI with the selected image
        setPhotos(prev => {
          let updatedPhotos = [...prev];
          if (slotIndex !== null) {
            updatedPhotos[slotIndex] = selectedImage;
          } else {
            updatedPhotos.push(selectedImage);
          }
          return updatedPhotos;
        });

        // Auto-upload the image
        await uploadSingleImage(selectedImage, slotIndex);
      }
    } catch (error) {
      console.log('Image Picker Error:', error);
      Alert.alert('Error', 'Unable to open image picker.');
    }
  };

  const uploadSingleImage = async (image, slotIndex) => {
    const tokenData = await AsyncStorage.getItem('userData');
    const { token: userToken } = tokenData ? JSON.parse(tokenData) : {};

    if (!userToken) {
      GlobalToast.showError("Error", "User not authenticated");
      return;
    }

    // Set uploading state
    setUploadingIndex(slotIndex !== null ? slotIndex : photos.length);

    const formData = new FormData();
    const uri = image.uri;
    const fileType = uri.split('.').pop();
    const fileName = `photo_${Date.now()}.${fileType}`;
    
    formData.append('images[]', {
      uri,
      type: `image/${fileType}`,
      name: fileName,
    });

    try {
      const response = await fetch(API_ENDPOINTS.USER_PICTURE, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        GlobalToast.showSuccess("Success", "Image uploaded successfully!");
        // Refresh the photos to get the updated list from server
        setTimeout(() => {
          fetchUploadedPhotos();
        }, 1000);
      } else {
        GlobalToast.showError("Error", result.message || "Upload failed");
        // Remove the failed image from UI
        setPhotos(prev => {
          if (slotIndex !== null) {
            return prev.filter((_, i) => i !== slotIndex);
          } else {
            return prev.slice(0, -1);
          }
        });
      }
    } catch (error) {
      console.log('Upload error:', error);
      GlobalToast.showError("Error", "An error occurred while uploading");
      // Remove the failed image from UI
      setPhotos(prev => {
        if (slotIndex !== null) {
          return prev.filter((_, i) => i !== slotIndex);
        } else {
          return prev.slice(0, -1);
        }
      });
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemovePhoto = async (imageUrl, index) => {
    // Case 1: Local image being uploaded
    if (uploadingIndex === index) {
      GlobalToast.showInfo("Info", "Please wait for upload to complete");
      return;
    }

    // Case 2: Local image (not saved yet)
    if (typeof photos[index] === "object" && photos[index]?.uri) {
      const updatedPhotos = photos.filter((_, i) => i !== index);
      setPhotos(updatedPhotos);
      GlobalToast.showInfo("Removed", "Image removed");
      return;
    }

    // Case 3: Already uploaded image -> call API
    const tokenData = await AsyncStorage.getItem('userData');
    const { token: userToken } = tokenData ? JSON.parse(tokenData) : {};

    if (!userToken) {
      GlobalToast.showError("Error", "User not authenticated");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.DELETE_IMAGE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ image: imageUrl }),
      });

      const result = await response.json();

      if (result.success) {
        const updatedPhotos = photos.filter((photo, i) => i !== index);
        setPhotos(updatedPhotos);
        GlobalToast.showSuccess("Delete Successful", "Image deleted successfully!");
      } else {
        GlobalToast.showError("Error", result.message || "Failed to delete image");
      }
    } catch (error) {
      console.log('Delete error:', error);
      GlobalToast.showError("Error", "An error occurred while deleting the image");
    }
  };

  const fetchUploadedPhotos = async () => {
    const token = await AsyncStorage.getItem('userData');
    const { token: userToken } = token ? JSON.parse(token) : {};

    if (!userToken) {
      Alert.alert('User not authenticated');
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.GET_PERSONAL_DETAILS, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          Accept: 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok && result.data.images) {
        setPhotos(result.data.images);
      }
    } catch (error) {
      console.log('Media fetch error:', error);
    }
  };

  const PhotoGrid = () => (
    <View style={styles.grid}>
      {[...Array(MAX_PHOTOS)].map((_, index) => {
        const photo = photos[index];
        const uri = typeof photo === 'string' ? photo : photo?.uri;
        const isUploading = uploadingIndex === index;
        
        return (
          <View key={index} style={styles.photoSlot}>
            {uri ? (
              <>
                <Image source={{ uri }} style={styles.image} />
                {isUploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="small" color="white" />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.deleteIcon}
                  onPress={() => handleRemovePhoto(uri, index)}
                  disabled={isUploading}
                >
                  <AntDesign 
                    name="delete" 
                    size={18} 
                    color={isUploading ? "gray" : "white"} 
                  />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddPhoto(index)}
                disabled={uploadingIndex !== null}
              >
                <Icon 
                  name="add" 
                  size={24} 
                  color={uploadingIndex !== null ? "gray" : "white"} 
                />
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
  // Save relationship goals
  const saveRelationshipGoals = async () => {
    //Alert.alert('Save Goals');
    try {
    const stored = await AsyncStorage.getItem('userData');
    const user = JSON.parse(stored || '{}');
    const token = user.token || '';

    const formData = new FormData();
    formData.append('about_me', relationshipGoals);

    const response = await fetch('https://webtechnomind.in/project/timble/api/update/profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      //setAbout(aboutText); // update local state
      Alert.alert('Success', 'About me updated successfully!');
      setAboutModalVisible(false);
    } else {
      Alert.alert('Error', result.message || 'Update failed');
    }
  } catch (error) {
    console.error('Error updating about_me:', error);
    Alert.alert('Error', 'Something went wrong. Please try again.');
  }

  }
  // Save relationship goals end

  // Save relationship type
  const saveRelationshipType = async () => {
    Alert.alert('Save Relationship Type');
  }

  // Save languages
  const saveLanguages = async () => {
    Alert.alert('Save Languages');
  }
  // Save weekend getaway places
  const saveWeekend = async () => {
    Alert.alert('Save Weekend Getaway Places');
  }
  // Save basics
  const saveBasics = async () => {
    Alert.alert('Save Basics');
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="black" />
          <Text style={styles.headerTitle}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Media</Text>
        <Text style={styles.sectionSubtitle}>
          Add up to 6 photos.
        </Text>
        <PhotoGrid />
        
        {/* About Me Modal */}
        <GlobalModal
        title="Weekend Getaway Places"
        value={weekend}
        setValue={setWeekend}
        visible={weekendVisible}
        onClose={() => setWeekendVisible(false)}
        onSave={saveWeekend}
      />
        
        {/* About Me */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekend getaway places</Text>
            <TouchableOpacity onPress={() => setWeekendVisible(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionContent}>
            {weekend || 'Write something Weekend getaway places'}
          </Text>
        </View>

        {/* Other scrollable content goes here */}
      <GlobalModal
        title="Relationship Goals"
        value={relationshipGoals}
        setValue={setRelationshipGoals}
        visible={relationshipGoalsVisible}
         placeholder="What are your relationship goals?"
        onClose={() => setRelationshipGoalsVisible(false)}
        onSave={saveRelationshipGoals}
        multiline={true}
      />
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Relationship Goals</Text>
            <TouchableOpacity onPress={() => setRelationshipGoalsVisible(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionContent}>{relationshipGoals || "Add your relationship goals"}</Text>
        </View>
       {/* Other scrollable content goes here */}
       <GlobalModal
          title="Relationship Type"
          value={relationshipType}
          setValue={setRelationshipType}
          visible={relationshipTypeVisible}
          onClose={() => setRelationshipTypeVisible(false)}
          onSave={saveRelationshipType}
        />
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Relationship Type </Text>
            <TouchableOpacity onPress={() => setRelationshipTypeVisible(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionContent}>
            {relationshipType || 'Write Relationship Type'}
          </Text>
        </View>
       {/* Other scrollable content goes here */}
      <GlobalModal
        title="Languages I Know"
        value={languages}
        setValue={setLanguages}
        visible={languagesVisible}
        onClose={() => setLanguagesVisible(false)}
        onSave={saveLanguages}
      />
       <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Languages i Know</Text>
            <TouchableOpacity onPress={() => setLanguagesVisible(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionContent}>
            {languages || 'Choose Languages'}
          </Text>
        </View>
      {/* Other scrollable content goes here */}
       

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basics</Text>
        </View>
      {/* Other scrollable content goes here */}
         <GlobalModal
            title="Basics"
            value={basics}
            setValue={setBasics}
            visible={basicsVisible}
            onClose={() => setBasicsVisible(false)}
            onSave={saveBasics}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Zodiac</Text>
            <TouchableOpacity onPress={() => setBasicsVisible(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionContent}>
            {about || 'Choose Zodiac'}
          </Text>
        </View>
      {/* Other scrollable content goes here */}    

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionContent: {
    paddingTop: 7,
    paddingBottom: 5,
    color: 'grey',
    opacity: 0.6
  },
  section: {
    borderBottomColor: "#C7C7C7",
    marginTop: 20,
    borderBottomWidth: 1,
    paddingBottom: 5,
    marginBottom: 10,
  },
  scrollContainer: {
    paddingHorizontal: wp('8%'),
    backgroundColor: '#fff',
    paddingBottom: hp('5%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('5%'),
    paddingTop: wp('4%'),
    backgroundColor: '#FFF',
  },
  editText: {
    fontSize: wp('4.5%'),
    color: '#E91E63',
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: 'semi-bold',
    marginLeft: 5,
    color: '#000',
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#333',
    marginTop: hp('0%'),
  },
  sectionSubtitle: {
    fontSize: wp('4.5%'),
    color: '#000',
    marginBottom: hp('1.5%'),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: SIZES.width - 40,
    justifyContent: 'space-between',
  },
  photoSlot: {
    width: (SIZES.width - 60) / 3,
    height: (SIZES.width - 40) / 80,
    aspectRatio: 3 / 4,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    marginBottom: wp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  deleteIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 5,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: -10,
    elevation: 8,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownItem: {
    paddingVertical: hp('1.8%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownLabel: {
    fontSize: wp('4.2%'),
    color: '#000',
    fontWeight: '500',
  },
  dropdownValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  dropdownValueText: {
    fontSize: wp('4%'),
    color: '#555',
  },
});

export default EditProfileScreen;