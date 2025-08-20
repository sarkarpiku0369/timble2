// utils/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

//const BASE_URL = 'https://webtechnomind.in/project/timble/api';
import API_ENDPOINTS from '../apiConfig';
const getToken = async () => {
  const stored = await AsyncStorage.getItem('userData');
  const user = JSON.parse(stored || '{}');
  return user.token || '';
};

// ✅ GET method
export const apiGet = async (endpoint, params = {}) => {
  const token = await getToken();
  const query = new URLSearchParams(params).toString();
  const url = `${API_ENDPOINTS.BASE_URL}/${endpoint}${query ? '?' + query : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error(`GET ${endpoint} error:`, error);
    throw error;
  }
};

// ✅ POST method (JSON body)
export const apiPost = async (endpoint, body = {}) => {
  const token = await getToken();

  try {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return await response.json();
  } catch (error) {
    console.error(`POST ${endpoint} error:`, error);
    throw error;
  }
};

// ✅ POST with FormData
export const apiPostFormData = async (endpoint, formData) => {
  const token = await getToken();

  try {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        // 'Content-Type': multipart/form-data is set automatically by fetch when using FormData
      },
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error(`POST FormData ${endpoint} error:`, error);
    throw error;
  }
};

// ✅ DELETE method (with optional body or params)
export const apiDelete = async (endpoint, params = {}) => {
  const token = await getToken();

  try {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return await response.json();
  } catch (error) {
    console.error(`DELETE ${endpoint} error:`, error);
    throw error;
  }
};
