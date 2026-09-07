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

export const getBonusFeesSettings = async () => {
  const response = await apiClient.get('/user/settings/bonus-fees');
  return response?.data;
};

export const updateMerchantAvatarApi = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await apiClient.post('/user/merchant/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response?.data;
};


export interface MerchantAccountResponse {
  stats: {
    total_balance: { usdt: number; bdt: number };
    total_earnings: { usdt: number; bdt: number };
    completed_orders: number;
    success_rate: number;
    security_deposit: number;
  };
  order_summary: { active: number; completed: number; cancelled: number; disputes: number };
  ads_overview: { total: number; buying: number; selling: number };
}

export interface MerchantOrderRow {
  id: string;
  type: string;
  side: string;
  amount: string;
  price: string;
  earning: string;
  status: string;
  date: string;
}

export interface PaginatedOrders {
  data: MerchantOrderRow[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const getMerchantAccountData = async (): Promise<MerchantAccountResponse> => {
  const response = await apiClient.get('/user/merchant/account-data');
  return response?.data;
};

export const getMerchantOrders = async (params: {
  page?: number;
  per_page?: number;
  status?: string;
  side?: string;
  search?: string;
} = {}): Promise<PaginatedOrders> => {
  const response = await apiClient.get('/user/merchant/orders', { params });
  return response?.data;
};

export interface EarningsChartResponse {
  labels: string[];
  earnings: number[];
  volume: number[];
}

export const getMerchantEarningsChart = async (
  days: number = 30
): Promise<EarningsChartResponse> => {
  const response = await apiClient.get('/user/merchant/earnings-chart', {
    params: { days },
  });
  return response?.data;
};
