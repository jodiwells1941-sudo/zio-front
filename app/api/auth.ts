import apiClient from "@/utils/apiClient";
import axios from "axios";

interface AuthResponse {
  data: unknown;
}

export const loginAPI = async (email: string, password: string): Promise<unknown> => {
  const response = await apiClient.post<AuthResponse>('/user-login', { email, password });
  return response.data;
};

export const registerAPI = async (data: unknown) => {
  const response = await apiClient.post('/register', data);
  return response.data;
};

export const updateUserInfo = async (userData: unknown) => {
  const response = await apiClient.post('/auth/user', userData);
  return response.data;
}

export const updatePassword = async (params: unknown) => {
  const response = await apiClient.post('/auth/reset-password', params);
  return response.data;
}

export const logoutAPI = async () => {
  const response = await apiClient.get('/auth/logout');
  return response.data;
};

// get auth user info from api and update localStorage
export const fetchUserInfoAPI = async () => {
  const response = await apiClient.get('/auth/user');
  return response.data;
};
// export const walletDataAPI = async (activeIndex) => {
//   const response = await apiClient.get('/user/wallet', { params: { type: activeIndex } });
//   return response?.data;
// };


export const walletSettingsDataApi = async () => {
  const response = await apiClient.get('/user/settings/wallet');
  return response?.data;
};

export const profileVerificationApi = async () => {
  const response = await apiClient.get('/user/profile-verification');
  return response?.data;
};

export const submitProfileVerificationApi = async (data: any) => {
  const response = await apiClient.post('/user/profile-verification', data);
  return response?.data;
}


export const updateWalletBuySettings = async (data: any) => {
  const response = await apiClient.post('/user/settings/update-buy-method', data);
  return response?.data;
};

export const updateWalletSellSettings = async (data: any) => {
  const response = await apiClient.post('/user/settings/update-sell-method', data);
  return response?.data;
};
export const resendVerificationEmail = async () => {
  const response = await apiClient.post('/email/resend');
  return response?.data;
};

export const getResendStatus = async () => {
  const response = await apiClient.get(
    '/email/resend-status',
  );
  return response?.data;
};


export const verifyOtp = async (otp: string) => {
  const response = await apiClient.post("/email/verify-otp", { otp });
  return response.data;
};







