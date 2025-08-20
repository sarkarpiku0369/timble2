import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'react-native-image-picker'; // 👈 or use react-native-image-picker
import { GlobalToast } from '../utils/GlobalToast';

const MyProfileScreen = ({ navigation }) => {
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('userData');
      const user = JSON.parse(stored);
      const token = user?.token || '';

      const response = await fetch(
        'https://webtechnomind.in/project/timble/api/get-customer-details',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setFullname(result.data.fullname || '');
        setPhone(result.data.phone || '');
        setEmail(result.data.email || '');
        setDob(result.data.dob || '');
        setGender(result.data.gender || '');
        setAvatar(result.data.avatar || '');
      } else {
        GlobalToast.showError('Error', result.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error(err);
      GlobalToast.showError('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
  const handlePickImage = () => {
  const options = {
    mediaType: 'photo',
    quality: 0.5,
  };

  ImagePicker.launchImageLibrary(options, (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
    } else if (response.assets && response.assets.length > 0) {
      setAvatar(response.assets[0].uri);
    }
  });
};

  // 🔹 Update profile
  const handleUpdateProfile = async () => {
    if (!email || !phone) {
      GlobalToast.showError('Missing Fields', 'Email and phone are required');
      return;
    }

    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('userData');
      const user = JSON.parse(stored);
      const token = user?.token || '';

      let formData = new FormData();
      formData.append('fullname', fullname);
      formData.append('phone', phone);
      formData.append('email', email);

      if (avatar && !avatar.startsWith('http')) {
        const filename = avatar.split('/').pop();
        const type = filename.split('.').pop();
        formData.append('avatar', {
          uri: avatar,
          name: filename,
          type: `image/${type}`,
        });
      }
      const response = await fetch(
        'https://webtechnomind.in/project/timble/api/update-customer-details',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      const result = await response.json();
      console.log('Update result:', result);

      if (result.success) {
        GlobalToast.showSuccess('Success', 'Profile updated successfully');
        fetchProfile(); // refresh data
      } else {
        GlobalToast.showError('Error', result.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      GlobalToast.showError('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color="black" />
            <Text style={styles.headerTitle}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={avatar ? { uri: avatar } : require('../assets/images/avatar.png')}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{fullname}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={fullname}
              onChangeText={setFullname}
              placeholder="Enter Name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter Mobile"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              value={dob}
              editable={false}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <TextInput
              style={styles.input}
              value={gender}
              editable={false}
              placeholderTextColor="#999"
            />
          </View>

          {/* Update Button */}
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>Update</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flex: 1 },
  header: { paddingTop: 10, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  profileSection: { alignItems: 'center', paddingVertical: 0, paddingHorizontal: 20 },
  profileImageContainer: { position: 'relative' },
  profileImage: { width: 100, height: 100, borderRadius: 60, backgroundColor: '#E0E0E0' },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: { fontSize: 18 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  userEmail: { fontSize: 16, color: '#666' },
  formContainer: { paddingHorizontal: 30, paddingBottom: 100 },
  inputGroup: { marginBottom: 10 },
  label: { fontSize: 15, marginBottom: 2, fontWeight: '500', color: '#000' },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FAFAFA',
  },
  updateButton: {
    backgroundColor: '#F93CA6',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 50,
  },
  updateButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default MyProfileScreen;
