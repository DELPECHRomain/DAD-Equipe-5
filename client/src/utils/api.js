import axios from "axios";


const apiClient = axios.create({
    baseURL: "http://localhost:3000",
    timeout: 5000,
});


export const loginUser = async (email, password) => {
    try {
        const response = await apiClient.post('/auth/login', {
            email,
            password,
        });

        console.log(response)
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const registerUser = async (username, email, password) => {
    try {
        const response = await apiClient.post('/auth/register', {
            username,
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getPosts = async () => {
  try {
    const response = await apiClient.get("/api/posts");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPost = async (content, token) => {
  try {
    const response = await apiClient.post(
      "/api/posts",
      { content },
      authHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePost = async (postId, token) => {
  const res = await axios.delete(`${API_URL}/posts/${postId}`, authHeaders(token));
  return res.data;
};

export const updatePost = async (postId, newContent, token) => {
  const res = await axios.put(`${API_URL}/posts/${postId}`, { content: newContent }, authHeaders(token));
  return res.data;
};
