import axios from 'axios';
import { logout } from './auth';

class CustomError extends Error {
    response?: any;
    status?: number;
}

const apiClient = axios.create({
    // use environment variable for base URL
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Don't set Content-Type for FormData, let the browser set it
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if(error?.response?.status === 401) {
            logout();
        }
        
        // Handle 422 and other validation errors
        if (error?.response?.status === 422 || error?.response?.data?.message) {
            const errorMessage = error.response.data.message || 'Validation failed';
            const customError = new CustomError(errorMessage);
            customError.response = error.response;
            customError.status = error.response.status;
            return Promise.reject(customError);
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;