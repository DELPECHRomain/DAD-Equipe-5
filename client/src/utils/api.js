import axios from "axios";

const authClient = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 5000,
});

const profileClient = axios.create({
  baseURL: "http://localhost:3002",
  timeout: 5000,
});

const postClient = axios.create({
  baseURL: "http://localhost:3003",
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


export const fetchUserPosts = async (token, userId) => {
  try {
    const response = await postClient.get(`/post-service/posts/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchFollowingPosts = async (token, followingIds) => {
  try {
    const response = await postClient.post(`/post-service/posts/following`, {
      followingIds
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const createPost = async (token, userId, content, media = []) => {
  try {
    const response = await postClient.post(
      `/post-service/posts`,
      {
        userId,
        content: content.trim(),
        media,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const updateUserProfile = async (token, userId, data) => {
  try {
    const response = await profileClient.put(`/profile-service/${userId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleLike = async (token, postId, userId) => {
  try {
    const response = await postClient.post(
      `/post-service/posts/${postId}/like`,
      { userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addReply = async (token, postId, userId, content) => {
  try {
    const response = await postClient.post(
      `/post-service/posts/${postId}/replies`,
      { userId, content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const searchProfiles = async (token, query) => {
  try {
    const response = await profileClient.get(`/profile-service/search?query=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleFollow = async (token, currentUserId, userIdToFollow) => {
  try {
    const response = await profileClient.post(
      `/profile-service/follow`,
      { currentUserId, userIdToFollow },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const uploadProfileImages = async (token, userId, formData) => {
  try {
    const response = await profileClient.put(
      `/profile-service/${userId}/images`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data; 
  } catch (err) {
    throw err;
  }
};
