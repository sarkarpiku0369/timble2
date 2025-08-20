/*
REQUIRED ANDROID PERMISSIONS (android/app/src/main/AndroidManifest.xml):

For Android 13+ (API 33+):
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_CONTACTS" />

For Android 12 and below:
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_CONTACTS" />

REQUIRED iOS PERMISSIONS (ios/YourApp/Info.plist):
<key>NSCameraUsageDescription</key>
<string>This app needs camera access for face detection and capture</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to save and access images</string>
<key>NSContactsUsageDescription</key>
<string>This app needs contacts access for user identification</string>

INSTALLATION:
npm install react-native-permissions
cd ios && pod install (for iOS)

For Android, also add to android/app/build.gradle:
implementation "com.github.japsz:RNPermissions:+"
*/

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import { request, PERMISSIONS, RESULTS, requestMultiple, check } from 'react-native-permissions';
import { Platform } from 'react-native';

const PermissionsScreen = ({ navigation }) => {
  const [permissions, setPermissions] = useState({
    apps: false,
    camera: false,
    photos: false,
    browser: false,
    contacts: false,
  });
  
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Check permissions on component mount
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
        // Keep simulated permissions as they were
        apps: prev.apps,
        browser: prev.browser,
      }));
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const permissionItems = [
    {
      id: 'apps',
      icon: '⊞',
      title: 'Allow to access apps',
      description: 'Access installed apps',
    },
    {
      id: 'camera',
      icon: '📷',
      title: 'Allow to access camera',
      description: 'Take photos and record videos',
    },
    {
      id: 'photos',
      icon: '🖼️',
      title: 'Allow to access photos',
      description: 'Access photo gallery',
    },
    {
      id: 'browser',
      icon: '🔍',
      title: 'Allow to access browser search',
      description: 'Access browser search functionality',
    },
    {
      id: 'contacts',
      icon: '👤',
      title: 'Allow to access contacts',
      description: 'Access your contacts',
    },
  ];

  const requestPermission = async (permissionType) => {
    try {
      let permissionToRequest;
      
      switch (permissionType) {
        case 'camera':
          permissionToRequest = Platform.OS === 'ios' 
            ? PERMISSIONS.IOS.CAMERA 
            : PERMISSIONS.ANDROID.CAMERA;
          break;
            
        case 'photos':
          if (Platform.OS === 'ios') {
            permissionToRequest = PERMISSIONS.IOS.PHOTO_LIBRARY;
          } else {
            if (Platform.Version >= 33) {
              // Android 13+ uses granular permissions
              permissionToRequest = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
            } else {
              permissionToRequest = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
            }
          }
          break;
          
        case 'contacts':
          permissionToRequest = Platform.OS === 'ios' 
            ? PERMISSIONS.IOS.CONTACTS 
            : PERMISSIONS.ANDROID.READ_CONTACTS;
          break;
          
        default:
          // For demo purposes (apps, browser), we'll simulate permission grant
          setPermissions(prev => ({
            ...prev,
            [permissionType]: true
          }));
          return;
      }

      // Check current permission status first
      const currentStatus = await check(permissionToRequest);
      
      if (currentStatus === RESULTS.GRANTED) {
        setPermissions(prev => ({
          ...prev,
          [permissionType]: true
        }));
        return;
      }

      // Request permission
      const result = await request(permissionToRequest);
      
      switch (result) {
        case RESULTS.GRANTED:
          setPermissions(prev => ({
            ...prev,
            [permissionType]: true
          }));
          Alert.alert('Success', `${permissionType} permission granted!`);
          break;
          
        case RESULTS.DENIED:
          Alert.alert(
            'Permission Denied', 
            `${permissionType} permission was denied. You can grant it later in settings.`
          );
          break;
          
        case RESULTS.BLOCKED:
          Alert.alert(
            'Permission Blocked',
            `${permissionType} permission is blocked. Please enable it in device settings.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => {
                  // You can add a function to open device settings
                  console.log('Open device settings for', permissionType);
                }
              }
            ]
          );
          break;
          
        case RESULTS.UNAVAILABLE:
          Alert.alert(
            'Feature Unavailable',
            `${permissionType} is not available on this device.`
          );
          break;
          
        default:
          console.log('Unknown permission result:', result);
      }
      
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert(
        'Error', 
        `Failed to request ${permissionType} permission. Please try again.`
      );
    }
  };

  const handleAccept = () => {
    if (!privacyAccepted || !termsAccepted) {
      Alert.alert('Agreement Required', 'Please accept the privacy policy and terms and conditions to continue.');
      return;
    }

    const allPermissionsGranted = Object.values(permissions).every(permission => permission === true);
    const grantedPermissions = Object.values(permissions).filter(Boolean).length;
    
    if (allPermissionsGranted) {
      // All permissions granted, navigate to FaceCaptureScreen
      Alert.alert(
        'Success!',
        'All permissions granted successfully. Proceeding to face capture.',
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigate to FaceCaptureScreen
              if (navigation) {
                //navigation.navigate('FaceCaptureScreen');
                navigation.navigate('AuthFlow', { screen: 'FaceCapture' });
              } else {
                console.log('Navigating to FaceCaptureScreen with all permissions granted:', permissions);
              }
            },
          },
        ]
      );
    } else {
      // Some permissions missing
      const missingCount = permissionItems.length - grantedPermissions;
      Alert.alert(
        'Permissions Required',
        `${missingCount} permission(s) still needed. Please grant all permissions to continue to face capture.`,
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    }
  };

  const PermissionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.permissionItem}
      onPress={() => requestPermission(item.id)}
      onLongPress={() => {
        // Long press to manually toggle for testing
        setPermissions(prev => ({
          ...prev,
          [item.id]: !prev[item.id]
        }));
      }}
      activeOpacity={0.7}
    >
      <View style={styles.permissionContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{item.icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.permissionTitle}>{item.title}</Text>
          <Text style={styles.permissionDescription}>{item.description}</Text>
        </View>
        <View style={[
          styles.checkmark,
          permissions[item.id] && styles.checkmarkActive
        ]}>
          {permissions[item.id] && <Text style={styles.checkmarkText}>✓</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  const CheckboxItem = ({ checked, onPress, children }) => (
    <TouchableOpacity 
      style={styles.checkboxContainer} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.checkbox,
        checked && styles.checkboxChecked
      ]}>
        {checked && <Text style={styles.checkboxText}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{children}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Title and Description */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Permissions</Text>
        <Text style={styles.subtitle}>
          Please allow us permission to access the following for fast and wide facial detection.
        </Text>
      </View>
    <ScrollView>
      {/* Permission Items */}
      <View style={styles.permissionsContainer}>
        {permissionItems.map((item) => (
          <PermissionItem key={item.id} item={item} />
        ))}
      </View>

      {/* Privacy and Terms */}
      <View style={styles.agreementContainer}>
        <CheckboxItem
          checked={privacyAccepted}
          onPress={() => setPrivacyAccepted(!privacyAccepted)}
        >
          I read the <Text style={styles.linkText}>Privacy policy</Text> and I accept
        </CheckboxItem>
        
        <CheckboxItem
          checked={termsAccepted}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          the <Text style={styles.linkText}>terms and conditions</Text>.
        </CheckboxItem>
      </View>

      {/* Accept Button */}
      <TouchableOpacity
        style={[
          styles.acceptButton,
          (!privacyAccepted || !termsAccepted) && styles.acceptButtonDisabled
        ]}
        onPress={handleAccept}
        disabled={!privacyAccepted || !termsAccepted}
        activeOpacity={0.8}
      >
        <Text style={styles.acceptButtonText}>
          {Object.values(permissions).every(p => p) ? 'Continue to Face Capture' : 'Accept'}
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    paddingVertical: 10,
  },
  backText: {
    fontSize: 16,
    color: '#333333',
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  permissionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  permissionItem: {
    backgroundColor: '#FFF0F8',
    borderRadius: 16,
    marginBottom: 12,
    paddingVertical: 4,
  },
  permissionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE8F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  permissionDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkActive: {
    backgroundColor: '#FFD700',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  agreementContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#FFD700',
  },
  checkboxText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  linkText: {
    color: '#FF69B4',
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#FF69B4',
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PermissionsScreen;