import apiClient from "@/utils/apiClient";

export const submitMerchantApplicationApi = async (data: any) => {
  const response = await apiClient.post('/user/merchant/application', data);
  return response?.data;
}

export const getMerchantDepositAmountApi = async () => {
  const response = await apiClient.get('/user/merchant/deposit-amount');
  return response?.data;
};

export const getMerchantAccount = async () => {
  const response = await apiClient.get('/user/merchant/account');
  return response?.data;
};

export const updateMerchantApplicationApi = async (data: any) => {
  const response = await apiClient.put('/user/merchant/account-update', data);
  return response?.data;
}
