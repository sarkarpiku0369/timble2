import React, { useState, useEffect } from 'react';
import { Image, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalToast } from '../utils/GlobalToast'; // ✅ Custom Toast

const PermissionsScreen = ({ navigation }) => {
  const [permissions, setPermissions] = useState({
    apps: false,
    camera: false,
    photos: false,
    browser: false,
    contacts: false,
    location: false,
  });

  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    try {
      const permissionsToCheck = {
        camera: Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
        photos: Platform.OS === 'ios'
          ? PERMISSIONS.IOS.PHOTO_LIBRARY
          : Platform.Version >= 33
            ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        contacts: Platform.OS === 'ios' ? PERMISSIONS.IOS.CONTACTS : PERMISSIONS.ANDROID.READ_CONTACTS,
        location: Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      };

      const results = await Promise.all(
        Object.entries(permissionsToCheck).map(async ([key, permission]) => {
          const status = await check(permission);
          return [key, status === RESULTS.GRANTED];
        })
      );

      const permissionStatus = Object.fromEntries(results);

      setPermissions(prev => ({
        ...prev,
        ...permissionStatus,
        apps: prev.apps,
        browser: prev.browser,
      }));
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestPermission = async (permissionType) => {
    try {
      let permissionToRequest;

      switch (permissionType) {
        case 'camera':
          permissionToRequest = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
          break;
        case 'photos':
          permissionToRequest = Platform.OS === 'ios'
            ? PERMISSIONS.IOS.PHOTO_LIBRARY
            : Platform.Version >= 33
              ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
              : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
          break;
        case 'contacts':
          permissionToRequest = Platform.OS === 'ios' ? PERMISSIONS.IOS.CONTACTS : PERMISSIONS.ANDROID.READ_CONTACTS;
          break;
        case 'location':
          permissionToRequest = Platform.OS === 'ios'
            ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
            : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
          break;
        default:
          setPermissions(prev => ({ ...prev, [permissionType]: true }));
          return;
      }

      const currentStatus = await check(permissionToRequest);

      if (currentStatus === RESULTS.GRANTED) {
        setPermissions(prev => ({ ...prev, [permissionType]: true }));
        return;
      }

      const result = await request(permissionToRequest);

      switch (result) {
        case RESULTS.GRANTED:
          setPermissions(prev => ({ ...prev, [permissionType]: true }));
          GlobalToast.showSuccess("Success", `${permissionType} permission granted!`);
          break;
        case RESULTS.DENIED:
          GlobalToast.showError("Permission Denied", `${permissionType} permission denied. You can grant it later in settings.`);
          break;
        case RESULTS.BLOCKED:
          GlobalToast.showError("Permission Blocked", `${permissionType} is blocked. Please enable it in device settings.`);
          // Optionally deep link to settings:
          // Linking.openSettings();
          break;
        case RESULTS.UNAVAILABLE:
          GlobalToast.showError("Unavailable", `${permissionType} is not available on this device.`);
          break;
      }
    } catch (error) {
      console.error('Permission request error:', error);
      GlobalToast.showError("Error", `Failed to request ${permissionType} permission. Please try again.`);
    }
  };

  const handleAccept = async () => {
    if (!privacyAccepted || !termsAccepted) {
      GlobalToast.showError("Agreement Required", "Please accept the privacy policy and terms and conditions to continue.");
      return;
    }

    const allGranted = Object.values(permissions).every(p => p);
    const grantedCount = Object.values(permissions).filter(Boolean).length;

    if (allGranted) {
      try {
        await AsyncStorage.setItem('permissionsGranted', 'true');
        GlobalToast.showSuccess("Success", "All permissions granted!");

        setTimeout(() => {
          navigation?.replace('Welcome');
        }, 1000);
      } catch (error) {
        console.error('Error saving permission state:', error);
      }
    } else {
      GlobalToast.showError("Permissions Required", `${permissionItems.length - grantedCount} permission(s) are still needed.`);
    }
  };

  const permissionItems = [
    { id: 'apps', icon: require('../assets/images/menu.png'), title: 'Allow to access apps', description: 'Access installed apps' },
    { id: 'camera', icon: require('../assets/images/wheel.png'), title: 'Allow to access camera', description: 'Take photos and record videos' },
    { id: 'photos', icon: require('../assets/images/photos.png'), title: 'Allow to access photos', description: 'Access photo gallery' },
    { id: 'browser', icon: require('../assets/images/search.png'), title: 'Allow to access browser search', description: 'Access browser search functionality' },
    { id: 'contacts', icon: require('../assets/images/contact.png'), title: 'Allow to access contacts', description: 'Access your contacts' },
    { id: 'location', icon: require('../assets/images/location.png'), title: 'Allow to access location', description: 'Location-based services' },
  ];

  const PermissionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.permissionItem}
      onPress={() => requestPermission(item.id)}
      onLongPress={() => setPermissions(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
      activeOpacity={0.7}
    >
      <View style={styles.permissionContent}>
        <View style={styles.iconContainer}>
          <Image source={item.icon} style={styles.eye} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.permissionTitle}>{item.title}</Text>
        </View>
        <View style={[styles.checkmark, permissions[item.id] && styles.checkmarkActive]}>
          {permissions[item.id] && <Text style={styles.checkmarkText}>✓</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  const CheckboxItem = ({ checked, onPress, children }) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkboxText}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{children}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="black" />
          <Text style={styles.backText}> Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Permissions</Text>
        <Text style={styles.subtitle}>
          Please allow us permission to access the following for fast and wide facial detection.
        </Text>
      </View>
      <ScrollView>
        <View style={styles.permissionsContainer}>
          {permissionItems.map(item => (
            <PermissionItem key={item.id} item={item} />
          ))}
        </View>
        <View style={styles.agreementContainer}>
          <CheckboxItem checked={privacyAccepted} onPress={() => setPrivacyAccepted(!privacyAccepted)}>
            I read the <Text style={styles.linkText}>Privacy policy</Text> and I accept
          </CheckboxItem>
          <CheckboxItem checked={termsAccepted} onPress={() => setTermsAccepted(!termsAccepted)}>
            the <Text style={styles.linkText}>terms and conditions</Text>.
          </CheckboxItem>
        </View>
        <TouchableOpacity
          style={[
            styles.acceptButton,
            (!privacyAccepted || !termsAccepted) && styles.acceptButtonDisabled,
          ]}
          onPress={handleAccept}
          disabled={!privacyAccepted || !termsAccepted}
        >
          <Text style={styles.acceptButtonText}>
            {Object.values(permissions).every(p => p) ? 'Accept' : 'Accept'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ✅ same as your styles
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: wp('5%'), paddingVertical: hp('1.2%') },
  backButton: { paddingVertical: hp('1%'), flexDirection: 'row' },
  backText: { fontSize: wp('4.5%'), color: '#333' },
  titleContainer: { paddingHorizontal: wp('5%'), marginBottom: hp('1%') },
  title: { fontSize: wp('8%'), fontWeight: 'bold', color: '#333', marginBottom: hp('1%') },
  eye: { width: 20, height: 20, resizeMode: 'contain' },
  subtitle: { fontSize: wp('4%'), color: '#666', lineHeight: hp('3%') },
  permissionsContainer: { paddingHorizontal: wp('5%') },
  permissionItem: { borderRadius: wp('4%'), marginBottom: hp('1.2%'), paddingVertical: hp('0.5%') },
  permissionContent: {
    alignItems: 'center',
    shadowColor: '#F93CA6',
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    elevation: 8,
    borderRadius: wp('10%'),
  },
  iconContainer: { width: wp('10%'), height: wp('10%'), justifyContent: 'center', alignItems: 'center', marginRight: wp('4%') },
  textContainer: { flex: 1 },
  permissionTitle: { fontSize: wp('4.2%'), fontWeight: '600', color: '#333' },
  checkmark: { width: wp('7%'), height: wp('7%'), borderRadius: wp('3.5%'), backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  checkmarkActive: { backgroundColor: '#FFD700' },
  checkmarkText: { color: '#F93CA6', fontSize: wp('4%'), fontWeight: 'bold' },
  agreementContainer: { paddingHorizontal: wp('5%'), marginBottom: hp('3%') },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: hp('1%') },
  checkbox: { width: wp('6%'), height: wp('6%'), borderRadius: wp('3%'), backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginRight: wp('3%') },
  checkboxChecked: { backgroundColor: '#FFD700' },
  checkboxText: { color: '#fff', fontSize: wp('3.5%'), fontWeight: 'bold' },
  checkboxLabel: { fontSize: wp('3.8%'), color: '#333', flex: 1 },
  linkText: { color: '#FF69B4', fontWeight: '600' },
  acceptButton: { backgroundColor: '#FF69B4', marginHorizontal: wp('5%'), marginBottom: hp('4%'), paddingVertical: hp('2%'), borderRadius: wp('6%'), alignItems: 'center' },
  acceptButtonDisabled: { backgroundColor: '#E0E0E0' },
  acceptButtonText: { color: '#fff', fontSize: wp('4.5%'), fontWeight: '600' },
});

export default PermissionsScreen;
