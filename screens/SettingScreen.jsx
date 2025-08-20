import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { GlobalToast } from '../utils/GlobalToast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_ENDPOINTS from '../apiConfig';

const SettingScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch profile details
  const fetchProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem('userData');
      if (!stored) {
        GlobalToast.showError("Error", "User not logged in");
        navigation.navigate('AuthFlow', { screen: 'Login' });
        return;
      }
      const user = JSON.parse(stored);
      const token = user.token || '';

      const response = await fetch(API_ENDPOINTS.GET_CUSTOMER_DETAILS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (data && data.success) {
        setProfile(data.data); // ✅ store profile in state
      } else {
        GlobalToast.showError("Error", data.message || "Failed to load profile");
      }
    } catch (error) {
      GlobalToast.showError("Error", "Unable to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ✅ Logout function (unchanged)
  const handleLogout = async () => {
    try {
      const stored = await AsyncStorage.getItem('userData');
      if (!stored) {
        GlobalToast.showError("Error", "User not logged in");
        navigation.navigate('AuthFlow', { screen: 'Login' });
        return;
      }
      const user = JSON.parse(stored);
      const token = user.token || '';

      const response = await fetch(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (data && data.success) {
        await AsyncStorage.removeItem('userData');
        GlobalToast.showSuccess("Successfully", "Logged out successfully.");
        navigation.navigate('AuthFlow', { screen: 'Login' });
      } else {
        GlobalToast.showError("Error", "Logout Failed");
      }
    } catch (error) {
      GlobalToast.showError("Error", "Unable to logout. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: profile?.avatar || 'https://via.placeholder.com/80' }}
                  style={styles.avatar}
                />
              </View>
              <Text style={styles.userName}>{profile?.fullname || "N/A"}</Text>
              <Text style={styles.userEmail}>{profile?.email || "N/A"}</Text>
            </>
          )}
        </View>

        {/* Settings Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('MyProfile')} 
            style={styles.optionItem}
          >
            <Image
              source={require('../assets/images/pro.png')}
              style={styles.group}
            />
            <Text style={styles.optionText}>My Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Image source={require('../assets/images/about.png')} style={styles.group} />
            <Text style={styles.optionText}>About</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Image source={require('../assets/images/notify.png')} style={styles.group} />
            <Text style={styles.optionText}>Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('ChangePassword')}>
            <Image source={require('../assets/images/lock.png')} style={styles.group} />
            <Text style={styles.optionText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        {/* Logout & Delete */}
        <View style={styles.NextOptionsContainer}>
          <TouchableOpacity onPress={handleLogout} style={styles.optionItem}>
            <Image source={require('../assets/images/logout.png')} style={styles.group} />
            <Text style={styles.optionText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionItem, styles.deleteOption]}>
            <Image source={require('../assets/images/delaccount.png')} style={styles.group} />
            <Text style={[styles.optionText, styles.deleteText]}>Delete My Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 10,
  },
  backButton: {
    marginRight: 16,
  },
    group: {
 marginRight: 15,
width: 20,
height: 20
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  optionsContainer: {
  paddingHorizontal: 16,
  margin: 30,

  // Android shadow
  elevation: 8, // 80 is too big — try 4–12 for natural shadow

  // iOS shadow
  shadowColor: '#000',
//   shadowOffset: { width: 0, height: 4 },
//   shadowOpacity: 0.2,
//   shadowRadius: 6,
  backgroundColor: '#fff', // required for iOS shadows
  borderRadius: 16,        // optional for rounded look
},
 NextOptionsContainer: {
  paddingHorizontal: 16,
  marginHorizontal: 30,
  marginVertical: 10,

  // Android shadow
  elevation: 8, // 80 is too big — try 4–12 for natural shadow

  // iOS shadow
  shadowColor: '#000',
//   shadowOffset: { width: 0, height: 4 },
//   shadowOpacity: 0.2,
//   shadowRadius: 6,
  backgroundColor: '#fff', // required for iOS shadows
  borderRadius: 16,        // optional for rounded look
},

  optionItem: {
    flexDirection: 'row',
    justifyContent: 'start',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
  },
  deleteOption: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  deleteText: {
    color: 'red',
  },

});

export default SettingScreen;