import apiClient from "@/utils/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export type P2pAdsData = {
  id: number;
  user_id: number;
  type: "buy" | "sell";

  asset: string;          // e.g. USDT
  with_fiat: string;      // e.g. BDT

  price_type: "fixed" | "floating";
  fixed_price: number;

  total_amount: number;

  order_limit_min: number;
  order_limit_max: number;

  payment_method_id: number;
  payment_time_limit: number;

  terms: string[];
  remarks: string | null;
  auto_reply: string | null;

  display_region: string;
  status: boolean;

  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  user: {
    id: number;
    name: string;
    avatar: string;
  };

  payment_method: {
    id: number;
    user_id: number;
    sell_method_id: number;
    currency_id: number;

    field_values: Record<string, string>; // dynamic fields

    remarks: string | null;
    qr_code: string | null;

    is_active: boolean;

    created_at: string;
    updated_at: string;

    sell_method: {
      id: number;
      name: string; // e.g. "Nagad", "Bank Transfer"
    };
  };
};

export interface P2pAdPayload {
  type: 'buy' | 'sell';
  asset: string;
  with_fiat: string;
  price_type: 'fixed' | 'floating';
  fixed_price: number;
  total_amount: string;
  order_limit_min: number;
  order_limit_max: number;
  payment_method_id: number;
  payment_time_limit: string;
  terms?: string[];
  remarks?: string;
  auto_reply?: string;
  display_region: string;
  status: boolean;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const getAllAds = async (params?: { type?: 'buy' | 'sell'; asset?: string; with_fiat?: string; page?: number }) => {
  const response = await apiClient.get('/user/p2p/all-ads', { params });
  return response?.data;
};
/** List authenticated user's ads */
export const getMyAds = async (params?: { type?: 'buy' | 'sell'; status?: boolean; page?: number }) => {
  const response = await apiClient.get('/user/p2p/ads', { params });
  return response?.data;
};

/** Fetch a single ad */
export const getAd = async (id: number) => {
  const response = await apiClient.get(`/user/p2p/ads/${id}`);
  return response?.data;
};

/** Create a new P2P ad */
export const createAd = async (data: P2pAdPayload) => {
  const response = await apiClient.post('/user/p2p/ads', data);
  return response?.data;
};

/** Update an existing P2P ad */
export const updateAd = async (id: number, data: Partial<P2pAdPayload>) => {
  const response = await apiClient.put(`/user/p2p/ads/${id}`, data);
  return response?.data;
};

/** Toggle the status of an ad */
export const toggleAdStatus = async (id: number) => {
  const response = await apiClient.patch(`/user/p2p/ads/${id}/toggle-status`);
  return response?.data;
};

/** Soft-delete an ad */
export const deleteAd = async (id: number) => {
  const response = await apiClient.delete(`/user/p2p/ads/${id}`);
  return response?.data;
};