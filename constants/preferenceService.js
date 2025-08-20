// services/preferenceService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_ENDPOINTS from '../apiConfig';

export default {
  async getUserToken() {
    const stored = await AsyncStorage.getItem('userData');
    if (stored) {
      const user = JSON.parse(stored);
      return user.token || '';
    }
    return '';
  },

  async fetchPreferenceOptions(token) {
    try {
      const response = await fetch(API_ENDPOINTS.PREFERENCE_GETDATA, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const json = await response.json();
      
      if (!json.success) {
        throw new Error('Failed to fetch preferences');
      }
      
      const result = {
        relationshipOptions: [],
        sexualityOptions: [],
        genderOptions: [],
        bodyTypeOptions: []
      };
      
      json.data.forEach(item => {
        switch (item.name) {
          case "Relationship Goal":
            result.relationshipOptions = item.details.map(detail => ({
              id: detail.id,
              label: detail.title,
              value: detail
            }));
            break;
          case "Sexuality type":
            result.sexualityOptions = item.details.map(detail => ({
              id: detail.id,
              label: detail.title,
              value: detail
            }));
            break;
          case "Gender Preference":
            result.genderOptions = item.details.map(detail => ({
              id: detail.id,
              title: detail.title,
              checkStatus: false
            }));
            break;
          case "Body Type Preference":
            result.bodyTypeOptions = item.details.map(detail => ({
              id: detail.id,
              title: detail.title,
              checkStatus: false
            }));
            break;
        }
      });
      
      return result;
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  },

  async savePreferences(token, payload) {
    try {
      const response = await fetch(API_ENDPOINTS.PREFERENCE_POSTDATA, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const json = await response.json();
      
      if (!json.success) {
        throw new Error(json.message || 'Failed to save preferences');
      }
      
      return json;
    } catch (error) {
      throw new Error(`Save Error: ${error.message}`);
    }
  }
};