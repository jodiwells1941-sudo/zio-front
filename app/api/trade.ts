
import apiClient from "@/utils/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GenerateTradePayload {
  type: 'buy' | 'sell';
  user_sell_method_id: number;
  amount: number;
  payment_method_id?: number;
}

export interface TradeData {
  id: number;
  order_id: string;
  client_id: number;
  customer_id: number;
  method_id: number;
  user_price: number;
  payable_amount: number;
  receivable_amount: number;
  status: number; // 1=pending,2=approved,3=rejected,4=rejected_for_balance,5=dispatched,6=dispatch_approved,7=dispatch_rejected,8=dispatch_timeout,9=completed
  created_by: number;
  notes: string | null;
  type: 'buy' | 'sell';           // appended
  is_client_seller: boolean;      // appended
  created_at: string;
  client?: {
    id: number;
    name: string;
    avatar?: string;
  };
  customer?: {
    id: number;
    name: string;
    avatar?: string;
  };
  method?: {
    id: number;
    method_name: string;
    walletNumber?: string;
    bankName?: string;
    price: number;
    min_amount: number;
    max_amount: number;
    duration: number;
    sell_method?: {
      id: number;
      name: string;
    };
  };
}

export interface TradeListRow {
  id: number;
  type: string;
  /** Matches `p2p_orders.side`; use for wallet route (p2p vs sell), not `type`. */
  order_side?: 'buy' | 'sell';
  /** Allowed next legacy statuses for the authenticated user (same as trade detail). */
  status_list?: number[];
  asset: string;
  date: string;
  orderNumber: string;
  price: string;
  cryptoAmount: string;
  cryptoValue: string;
  isCustomer: boolean;
  counterparty: string;
  status: number;
  status_text: string;
}

// Get all trades for the authenticated user (paginated)
export const getTrades = async (params?: Record<string, string | number>) => {
  const response = await apiClient.get('/user/trade', { params });
  return response?.data;
};

// ─── Generate (create) a trade ────────────────────────────────────────────────

export const generateTrade = async (data: GenerateTradePayload) => {
  const response = await apiClient.post('/user/trade', data);
  return response?.data;
};

// ─── Fetch a single trade by id ───────────────────────────────────────────────

export const getTrade = async (id: number) => {
  const response = await apiClient.get(`/user/trade/show/${id}`);
  return response?.data;
};

// ─── Update trade status ─────────────────────────────────────────────────────

export const updateTradeStatus = async (id: number, status: number, notes?: string) => {
  const response = await apiClient.post(`/user/trade/update/${id}/status`, { status, notes });
  return response?.data;
};

// ─── Trade chat (REST + Reverb) ───────────────────────────────────────────────

export interface TradeMessageRow {
  id: number;
  trade_id: number;
  sender_id: number;
  message: string | null;
  type: string;
  attachment: string | null;
  send_at: string | null;
  created_at: string | null;
  sender: { id: number; name: string; avatar?: string } | null;
  is_sender?: boolean;
}

export const getTradeMessages = async (tradeId: number) => {
  const response = await apiClient.get(`/user/trade/${tradeId}/messages`);
  return response?.data;
};

export const sendTradeMessage = async (
  tradeId: number,
  payload: { message?: string; attachment?: File | null }
) => {
  const form = new FormData();
  if (payload.message?.trim()) form.append("message", payload.message.trim());
  if (payload.attachment) form.append("attachment", payload.attachment);
  const response = await apiClient.post(`/user/trade/${tradeId}/messages`, form);
  return response?.data;
};

export const generateTradeReview = async (data: any) => {
  const response = await apiClient.post('/user/trade/review', data);
  return response?.data;
};

