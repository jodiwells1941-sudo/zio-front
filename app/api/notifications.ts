import apiClient from "@/utils/apiClient";

export type UserNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: {
    trade_id?: number;
    order_id?: string;
    action?: string;
    url?: string;
    scope?: string;
  };
  read_at?: string | null;
  created_at?: string | null;
};

export type NotificationResponse = {
  items: UserNotification[];
  unread_count: number;
};

export const getNotifications = async (limit = 30): Promise<NotificationResponse> => {
  const response = await apiClient.get("/user/notifications", { params: { limit } });
  return response?.data?.data ?? { items: [], unread_count: 0 };
};

export const markNotificationRead = async (id: number) => {
  const response = await apiClient.post(`/user/notifications/${id}/read`);
  return response?.data?.data;
};

export const markAllNotificationsRead = async () => {
  const response = await apiClient.post("/user/notifications/read-all");
  return response?.data?.data;
};
