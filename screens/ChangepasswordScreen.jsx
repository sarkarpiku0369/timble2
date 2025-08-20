import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalToast } from '../utils/GlobalToast'; // ✅ your toast util

const ChangepasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      GlobalToast.showError("Missing Fields", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      GlobalToast.showError("Mismatch", "New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('userData');
      const user = JSON.parse(stored);
      const token = user.token || '';

      const formData = new FormData();
      formData.append("current_password", currentPassword);
      formData.append("new_password", newPassword);
      formData.append("new_password_confirmation", confirmPassword);

      const response = await fetch(
        "https://webtechnomind.in/project/timble/api/change-password",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ pass user token
          },
          body: formData,
        }
      );

      const result = await response.json();
      console.log("Change password response:", result);

      if (result.success) {
        GlobalToast.showSuccess("Success", result.message || "Password changed successfully");
        navigation.goBack();
      } else {
        GlobalToast.showError("Error", result.message || "Unable to change password");
      }
    } catch (err) {
      console.error(err);
      GlobalToast.showError("Error", "Something went wrong. Please try again later.");
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
            <Text style={styles.headerTitle}>Change Password</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter current password"
              placeholderTextColor="#999"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleChangePassword}
            disabled={loading}
          >
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

export default ChangepasswordScreen;
