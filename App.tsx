// App.js
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesomep from 'react-native-vector-icons/FontAwesome6';
//toster
import Toast from 'react-native-toast-message';
import { toastConfig } from './utils/GlobalToast';

//import Toast from './utils/GlobalToast'; // Adjust the import path as needed
// Screens
import SplashScreen from './screens/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';
import LocationScreen from './screens/LocationScreen';
import WishlistScreen from './screens/WishlistScreen';
import VerifyOtpScreen from './screens/VerifyOtpScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import SuccessPaymentScreen from './screens/SuccessPaymentScreen';
import FailedPaymentScreen from './screens/FailedPaymentScreen';
// Auth Screens
import LoginScreen from './auth/LoginScreen';
import SignupScreen from './auth/SignupScreen';
import VerifyScreen from './auth/VerifyScreen';
import AuthUser from './auth/AuthUser';
import YourInterests from './auth/YourInterests';
import MatchPreferences from './auth/MatchPreferences';
import AddpicsScreen from './auth/AddpicsScreen';
import ChatScreen from './auth/ChatScreen';
import ProfileScreen from './auth/ProfileScreen';
import ProfileDetails from './auth/ProfileDetails';
import ChatDetails from './auth/ChatDetails';
import ForgetPassword from './screens/ForgetPassword';
import EditprofileScreen from './auth/EditprofileScreen';
//face verify 3 screens
import FaceVerifyScreen from './auth/FaceverifyScreen';
import PermissionsScreen from './auth/PermissionsScreen';
import FaceCaptureScreen from './auth/FaceCaptureScreen';

import WalletsScreen from './auth/WalletsScreen';
import CalculateScreen from './auth/CalculateScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SettingScreen from './screens/SettingScreen';
import MyProfileScreen from './screens/MyProfileScreen';
import ChangepasswordScreen from './screens/ChangepasswordScreen';
//import { requestStoragePermission } from './utils/permission';
// Navigators
const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();



function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Edit Profile" component={EditprofileScreen} />
      {/* <ProfileStack.Screen name="Setting" component={SettingScreen} />
      <ProfileStack.Screen name="MyProfile" component={MyProfileScreen} /> */}
      {/* <ProfileStack.Screen name="Profile Details" component={ProfileDetails} /> */}
      {/* <ProfileStack.Screen name="Wallet" component={WalletsScreen} />
      <ProfileStack.Screen name="Package" component={PackageScreen} /> */}
    </ProfileStack.Navigator>
  );
}
// Home Stack
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Details" component={DetailsScreen} />
    </HomeStack.Navigator>
  );
}

// Auth Stack
function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="Verify" component={VerifyScreen} />
      <AuthStack.Screen name="Auth User" component={AuthUser} />
      <AuthStack.Screen name="Your Interests" component={YourInterests} />
      <AuthStack.Screen name="Preferences" component={MatchPreferences} />
      <AuthStack.Screen name="Addpics" component={AddpicsScreen} />
      <AuthStack.Screen name="Chat Details" component={ChatDetails} />
      <AuthStack.Screen name="Forget Password" component={ForgetPassword} />
      <AuthStack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <AuthStack.Screen name="FaceVerify" component={FaceVerifyScreen} />
      {/* <AuthStack.Screen name="Permissions" component={PermissionsScreen} /> */}
      <AuthStack.Screen name="FaceCapture" component={FaceCaptureScreen} />
      <AuthStack.Screen name="Profile Details" component={ProfileDetails} />
      {/* <AuthStack.Screen name="Wallet" component={WalletsScreen} /> */}
    </AuthStack.Navigator>
  );
}

// Main App Tabs
function MainApp() {
   const [message, setMessage] = useState<number | null>(null);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const stored = await AsyncStorage.getItem("message");
        if (stored) {
          setMessage(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Error loading from AsyncStorage:", error);
      }
    };

    fetchMessage();
    // Optional: refresh every time the tab changes
    const interval = setInterval(fetchMessage, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);
  // useEffect(() => {
  //   requestStoragePermission();
  // }, []);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#f5429b',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          height: 80,
          position: 'absolute',
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          elevation: 10,
          paddingHorizontal: 20,
          paddingTop: 15,
        },
        tabBarLabel: ({ focused, color }) => {
          if (focused) {
            return null; // hide title if active
          } else {
            return (
              <Text style={{ color: 'white', fontSize: 12 }}>
                {route.name}
              </Text>
            );
          }
        },
        tabBarIcon: ({ focused }) => {
          const iconSize = 24;
          let iconComponent = null;

          if (route.name === 'Home') {
            iconComponent = (
              <AntDesign name="home" size={iconSize} color={focused ? '#f5429b' : 'white'} />
            );
          } else if (route.name === 'Location') {
            iconComponent = (
              <AntDesign name="enviromento" size={iconSize} color={focused ? '#f5429b' : 'white'} />
            );
          } else if (route.name === 'Likes') {
            iconComponent = (
              <FontAwesome name="heart" size={iconSize} color={focused ? '#f5429b' : 'white'} />
            );
          } else if (route.name === 'Chat Box') {
  iconComponent = (
    <View>
      <AntDesign
        name="wechat"
        size={iconSize}
        color={focused ? '#f5429b' : 'white'}
      />
      {/* Badge Circle */}
      <View
        style={{
          position: 'absolute',
          right: -10,
          top: -8,
          backgroundColor: '#FFCA30',
          borderRadius: 12,
          width: 20,
          height: 20,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 2,
        }}
      >
        <Text style={{ color: 'black', fontSize: 12, fontWeight: 'bold' }}>
          {message && message > 0 ? message : 0}
        </Text>
        {/* <Text>{JSON.stringify(message, null, 2)}</Text> */}
      </View>
    </View>
  );
          } else if (route.name === 'Profile') {
            iconComponent = (
              <FontAwesomep name="user-large" size={iconSize} color={focused ? '#f5429b' : 'white'} />
            );
          }

          if (focused) {
            return (
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 30,
                  padding: 8,
                  width: 42,
                  height: 42,
                  alignItems: 'center',
                  justifyContent: 'center',
                  top: 8,
                  shadowColor: '#000',
                }}
              >
                {iconComponent}
              </View>
            );
          } else {
            return iconComponent;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Location" component={LocationScreen} />
      <Tab.Screen name="Likes" component={WishlistScreen} />
      <Tab.Screen name="Chat Box" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
      {/* <Tab.Screen name="FaceCapture" component={FaceVerifyScreen} /> */}
    </Tab.Navigator>
  );
}

// Root Stack
export default function App() {
  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Splash" component={SplashScreen} />
        <RootStack.Screen name="Welcome" component={WelcomeScreen} />
        <RootStack.Screen name="AuthFlow" component={AuthStackScreen} />
        <RootStack.Screen name="MainApp" component={MainApp} />
        <RootStack.Screen name="Wallet" component={WalletsScreen} />
        <ProfileStack.Screen name="Setting" component={SettingScreen} />
        <ProfileStack.Screen name="MyProfile" component={MyProfileScreen} />
        <ProfileStack.Screen name="ChangePassword" component={ChangepasswordScreen} />
        {/* <RootStack.Screen name="Package" component={PackageScreen} /> */}
        <RootStack.Screen name="Calculate" component={CalculateScreen} />
        <RootStack.Screen name="SuccessPayment" component={SuccessPaymentScreen} />
        <RootStack.Screen name="FailedPayment" component={FailedPaymentScreen} />
        {/* <RootStack.Screen name="FaceCapture" component={FaceVerifyScreen} /> */}
        <RootStack.Screen name="Permissions" component={PermissionsScreen} />

      </RootStack.Navigator>
      <Toast config={toastConfig} />

    </NavigationContainer>
  );
}
