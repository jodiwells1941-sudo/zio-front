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

export interface AppealRow {
  id: number | string;
  order_id: string;
  p2p_order_id: string | number;
  type: string;
  side: string;
  amount: string;
  price: string;
  customer: string;
  client: string;
  user_image?: string | null;
  merchant_image?: string | null;
  status: string;
  status_text?: string;
  appeal_note?: string | null;
  appeal_reason?: string | null;
  appealed_at?: string | null;
  date?: string | null;
}

export interface PaginatedAppeals {
  data: AppealRow[];
  current_page: number;
  per_page: number;
  total: number;
}

export const getMerchantAppeals = async (params: { page?: number; per_page?: number } = {}): Promise<PaginatedAppeals> => {
  const response = await apiClient.get('/user/merchant/appeal-list', { params });
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

export interface AppealOverviewPoint {
  label: string;
  total: number;
  resolved: number;
  pending: number;
  cancelled: number;
}

export interface AppealReasonSlice {
  key: string;
  label: string;
  value: number;
}

export interface AppealStats {
  total: number;
  pending: number;
  under_review: number;
  resolved: number;
  cancelled: number;
  overview: AppealOverviewPoint[];
  reasons: AppealReasonSlice[];
}

export const getMerchantAppealStats = async (days = 30): Promise<AppealStats> => {
  const response = await apiClient.get('/user/merchant/appeal-stats', { params: { days } });
  return response?.data;
};

export interface AppealOrderLookup {
  order_id: string;
  id: number | string;
  side: 'Buy' | 'Sell';
  asset: string;
  amount: string;
  price: string;
  fiat: string;
  merchant_name: string;
  merchant_avatar?: string | null;
  date: string;
  status: string;
  status_text: string;
  /** false when the order is already completed and can no longer be appealed. */
  appealable: boolean;
}

export const lookupMerchantOrderForAppeal = async (
  orderId: string
): Promise<{ data: AppealOrderLookup }> => {
  const response = await apiClient.get('/user/merchant/appeal-order-lookup', {
    params: { order_id: orderId },
  });
  return response?.data;
};

export interface CreateAppealPayload {
  order_id: string;
  type: string;
  subject: string;
  description: string;
  amount_sent?: string;
  payment_datetime?: string;
  proof?: File | null;
}

export const createMerchantAppeal = async (payload: CreateAppealPayload) => {
  const form = new FormData();
  form.append('order_id', payload.order_id);
  form.append('type', payload.type);
  form.append('subject', payload.subject);
  form.append('description', payload.description);
  if (payload.amount_sent) form.append('amount_sent', payload.amount_sent);
  if (payload.payment_datetime) form.append('payment_datetime', payload.payment_datetime);
  if (payload.proof) form.append('proof', payload.proof);

  const response = await apiClient.post('/user/merchant/appeal-create', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response?.data;
};