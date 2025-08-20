import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, ActivityIndicator, Platform } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useNavigation } from '@react-navigation/native';
const FaceCaptureScreen = () => {
  const navigation = useNavigation();
  const [capturedImage, setCapturedImage] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('denied');

  // Request camera permissions
  useEffect(() => {
    const requestCameraPermission = async () => {
      const cameraPermissionType = Platform.select({
        android: PERMISSIONS.ANDROID.CAMERA,
        ios: PERMISSIONS.IOS.CAMERA,
      });

      try {
        // Check current permission status
        const status = await check(cameraPermissionType);
        
        if (status === RESULTS.GRANTED) {
          setCameraPermission('granted');
        } else if (status === RESULTS.DENIED) {
          // Request permission if not granted
          const permissionResult = await request(cameraPermissionType);
          setCameraPermission(permissionResult);
        } else {
          setCameraPermission(status);
        }
      } catch (error) {
        console.error('Permission error:', error);
        setCameraPermission('unavailable');
      }
    };

    requestCameraPermission();
  }, []);

  // Open camera and capture image
  const openCamera = async () => {
    if (cameraPermission !== RESULTS.GRANTED) {
      alert('Camera permission is required for face verification');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.8,
        includeBase64: true,
        saveToPhotos: false,
      });

      if (result.didCancel) {
        setVerificationResult('Cancelled');
      } else if (result.errorCode) {
        setVerificationResult(`Error: ${result.errorMessage}`);
      } else if (result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setCapturedImage(image.uri);
        await verifyFace(image.uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setVerificationResult('Camera failed');
    } finally {
      setIsProcessing(false);
    }
  };

  
  const verifyFace = async (fileUri) => {
  try {
    const formData = new FormData();

    // Extract filename from URI
    const filename = fileUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename ?? '');
    const fileType = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('image', {
      name: filename,
      type: fileType,
      uri: fileUri,
    });
    //console.log('formData',fileUri);
    const response = await fetch('http://69.62.76.176:5000/detect-gender', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();
    console.log('face', data);

    setVerificationResult(data.is_female
      ? 'Verification Successful ✅'
      : data.message
    );
    
  } catch (error) {
    console.error('API error:', error);
    setVerificationResult('Server connection failed..: ' + error.message);
  }
};


  const resetProcess = () => {
    setCapturedImage(null);
    setVerificationResult(null);
  };

  // Render permission-related UI
  if (cameraPermission === 'denied' || cameraPermission === 'blocked') {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera access is required for face verification
        </Text>
        <Text style={styles.permissionHelp}>
          Please enable camera permission in your device settings
        </Text>
        <Button
          title="Open Settings"
          onPress={() => {
            // Platform-specific settings open
            if (Platform.OS === 'ios') {
              // For iOS
              Linking.openURL('app-settings:');
            } else {
              // For Android
              IntentLauncher.startActivity({
                action: 'android.settings.APPLICATION_DETAILS_SETTINGS',
                data: 'package:com.yourapp.package',
              });
            }
          }}
        />
      </View>
    );
  }

  if (cameraPermission === 'unavailable') {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera not available on this device
        </Text>
      </View>
    );
  }

  if (cameraPermission !== 'granted') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.permissionText}>Checking permissions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} />
          
          {verificationResult ? (
            <>
              <Text style={[
                styles.resultText, 
                verificationResult.includes('Successful') ? styles.success : styles.failure
              ]}>
                {verificationResult}
              </Text>
              <Button title="Verify Again" onPress={resetProcess} />
            </>
          ) : (
            <ActivityIndicator size="large" color="#fff" />
          )}
        </View>
      ) : (
        <View style={styles.cameraPlaceholder}>
          <View style={styles.captureFrame}>
            <Text style={styles.instructionText}>Position your face inside the frame</Text>
          </View>
          <View style={{flexDirection:"row", gap:8}}>
          <Button
            title={isProcessing ? "Processing..." : "Verify Face"}
            onPress={openCamera}
            disabled={isProcessing}
           
            style={styles.verifybtn}
          />
          <Button title="Skip" onPress={() => navigation.navigate('MainApp', { screen: 'Profile' })} />
          </View>
          {isProcessing && (
            <ActivityIndicator style={styles.loader} size="large" color="#000" />
          )}
          
          {verificationResult && !isProcessing && (
            <Text style={styles.failure}>{verificationResult}</Text>
          )}
          
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  verifybtn:{
    borderColor:"#fff",
    borderWidth:1,
    backgroundColor:"#fff"
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionHelp: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  captureFrame: {
    width: 250,
    height: 330,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  preview: {
    width: '90%',
    height: '60%',
    borderRadius: 10,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  resultText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  success: {
    color: '#4CAF50',
  },
  failure: {
    color: '#F44336',
  },
  loader: {
    marginTop: 20,
  },
});

export default FaceCaptureScreen;