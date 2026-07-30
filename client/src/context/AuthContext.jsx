import { useState } from 'react';
import api from '../utils/axios';
import { AuthContext } from './useAuth';

export const AuthProvider = ({ children }) => {
    const [loading] = useState(false);

    const [user, setUser] = useState(() => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch (err) {
            console.error("Failed to parse local user info:", err);
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            return null;
        }
    });

    const setAuthSession = (data) => {
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
    };

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            const userData = data.user || data;
            setAuthSession(userData);
            return userData;
        } catch (error) {
            if (error.response?.data?.needsVerification) {
                const verificationError = new Error(error.response.data.message);
                verificationError.needsVerification = true;
                throw verificationError;
            }
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            const { data } = await api.post('/auth/verify-otp', { email, otp });
            setAuthSession(data);
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'OTP verification failed';
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
    };

    const value = {
        user,
        loading,
        login,
        register,
        verifyOTP,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
