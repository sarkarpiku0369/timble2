import React, { useState } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import LayoutBackImage from "../components/layoutBackImage";
import { SIZES, FONTS, COLORS } from "../constants/StyleConfig";
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottonCommon from '../components/bottonCommon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_ENDPOINTS from '../apiConfig';
//import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
const MAX_PHOTOS = 6;
const AddpicsScreen = ({ navigation }) => {
  const [photos, setPhotos] = useState([]);

const handleAddPhoto = async () => {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      selectionLimit: MAX_PHOTOS - photos.length,
    });

    if (!result.didCancel && result.assets?.length) {
      setPhotos(prev => [...prev, ...result.assets]);
    }
  } catch (error) {
    console.log('Image Picker Error:', error);
    alert('Unable to access photos. Please check app permissions.');
  }
};


  const handleRemovePhoto = index => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const token = await AsyncStorage.getItem('userData');
    const { token: userToken } = token ? JSON.parse(token) : {};
    //console.log('token',userToken);
    if (!userToken) {
      alert('User not authenticated');
      return;
    }

    const formData = new FormData();

    photos.forEach((photo, index) => {
      const uri = photo.uri;
      const fileType = uri.split('.').pop();
      const fileName = `photo_${index + 1}.${fileType}`;

      formData.append('images[]', {
        uri,
        type: `image/${fileType}`,
        name: fileName,
      });
    });

    try {
      const response = await fetch(API_ENDPOINTS.USER_PICTURE, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userToken}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert('Images uploaded successfully!');
         setTimeout(() => {
          navigation.replace("MainApp");
        }, 3000);
      } else {
        alert('Failed to upload images. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again later.');
    }
  };

  return (
    <LayoutBackImage>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.titleContainer}>
          <Text style={{ ...FONTS.h1, fontWeight: 'bold' }}>Add your recent pics</Text>
          <Text style={{ ...FONTS.h5 }}>
            Upload 2 photos to start. Add 4 or more to make your profile stand out.
          </Text>
        </View>
        <View style={styles.grid}>
          {[...Array(MAX_PHOTOS)].map((_, index) => (
            <View key={index} style={styles.photoSlot}>
              {photos[index] ? (
                <>
                  <Image source={{ uri: photos[index].uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.deleteIcon}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <AntDesign name="delete" size={15} color={COLORS.white} />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity onPress={handleAddPhoto} style={styles.addButton}>
                  <Icon name="add" size={24} color={COLORS.white} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
        <BottonCommon handleSubmit={handleUpload} label="Upload and Continue" />
      </ScrollView>
    </LayoutBackImage>
  );
};

const styles = StyleSheet.create({
  scroll: {
    alignItems: 'center',
    padding: 20,
    marginTop: 30
  },
  titleContainer: {
    marginTop: SIZES.height * 0.30,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: SIZES.width - 40,
    justifyContent: 'space-between',
  },
  photoSlot: {
    width: (SIZES.width - 60) / 3,
    height: (SIZES.width - 50) / 2.5,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    // overflow: 'hidden',
    elevation: 4,
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
    backgroundColor: 'rgba(221, 215, 215, 0.5)',
    padding: 6,
    borderRadius: 20,
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
    elevation: 8, // Add this for Android
  },
});

export default AddpicsScreen;
