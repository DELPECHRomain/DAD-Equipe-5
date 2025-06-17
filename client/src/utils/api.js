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