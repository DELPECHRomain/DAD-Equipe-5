import axios from "axios";

const authClient = axios.create({
  baseURL: "http://localhost:3000", 
  timeout: 5000,
});

const profileClient = axios.create({
  baseURL: "http://localhost:3002", 
  timeout: 5000,
});


export const loginUser = async (email, password) => {
  try {
    const response = await authClient.post('/auth-service/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (username, email, password) => {
  try {
    const response = await authClient.post('/auth-service/register', {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUserProfile = async (token, userId) => {
  try {
    const response = await profileClient.get(`/profile-service/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
