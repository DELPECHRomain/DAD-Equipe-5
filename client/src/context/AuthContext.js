"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "@/utils/api";
import { parseJwt } from "@/utils/jwt";


const AuthContext = createContext();


export const AuthProvider = ({ children }) => {

    const [accessToken, setAccessToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState(null);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            setAccessToken(token);
            const payload = parseJwt(token);
            setUserId(payload?.userId || null);
            setUsername(payload?.username || null);
        }
        setIsLoading(false);
    }, []);


    const register = async (username, email, password) => {
        try {
            const data = await registerUser(username, email, password);
            if (!data.status) {
                throw new Error(data.message || "Registration failed.");
            }

        } catch (error) {
            console.error(error);
            throw new Error("Registration failed, please check your details.");
        }
    };


    const login = async (email, password) => {
        try {
            const data = await loginUser(email, password);
            const { token } = data;
            if (token) {
                setAccessToken(token);
                localStorage.setItem("accessToken", token);
                const payload = parseJwt(token);
                setUserId(payload?.userId);
                setUsername(payload?.username);
            } else {
                throw new Error("Login failed, no token received.");
            }
        } catch (error) {
            console.error(error);
            throw new Error("Login failed, please check your credentials.");
        }
    };

    const logout = () => {
        setAccessToken(null);
        setUserId(null);
        setUsername(null);
        localStorage.removeItem("accessToken");
    };

    return (
        <AuthContext.Provider value={{ accessToken, userId, username, login, logout, register, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);