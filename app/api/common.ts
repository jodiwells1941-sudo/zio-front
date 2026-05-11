import apiClient from "@/utils/apiClient";

// ─── Contact ──────────────────────────────────────────────────────────────────

export const submitContactFormApi = async (formData: {
  name: string;
  email: string;
  mobile: string;
  message: string;
}) => {
  try {
    const response = await apiClient.post("/contact-us", formData);
    return response.data;
  } catch (error) {
    console.error("Error submitting contact form:", error);
    throw error;
  }
};

// ─── Currency & Sell Method Options ──────────────────────────────────────────

export const currencyOptions = async () => {
  const response = await apiClient.get("/user/options/currency");
  return response?.data;
};

export const walletSellMethods = async () => {
  const response = await apiClient.get("/user/options/sell-methods");
  return response?.data;
};

/**
 * Fetch sell methods filtered by currency_id.
 * Used in the payment modal to dynamically load methods after currency selection.
 */
export const sellMethodsByCurrency = async (currencyId: number) => {
  const response = await apiClient.get("/user/options/sell-methods", {
    params: { currency_id: currencyId },
  });
  return response?.data;
};

// ─── User Payment Methods (CRUD) ──────────────────────────────────────────────

/**
 * GET /user/payment-methods
 * Returns all active payment methods for the authenticated user.
 */
export const getUserPaymentMethods = async () => {
  const response = await apiClient.get("/user/payment-methods");
  return response?.data;
};

/**
 * GET /user/payment-methods/:id
 * Returns a single payment method by ID.
 */
export const getUserPaymentMethodById = async (id: number) => {
  const response = await apiClient.get(`/user/payment-methods/${id}`);
  return response?.data;
};

/**
 * POST /user/payment-methods
 * Creates a new payment method for the authenticated user.
 */
// export const createUserPaymentMethod = async (payload: {
//   sell_method_id: number;
//   currency_id: number;
//   field_values: Record<string, string>;
//   remarks?: string;
//   qr_code?: string;
// }) => {
//   const response = await apiClient.post("/user/payment-methods", payload);
//   return response?.data;
// };
export const createUserPaymentMethod = async (payload: {
  sell_method_id: number;
  currency_id: number;
  field_values: Record<string, string>;
  remarks?: string;
  qr_code?: File | null;
}) => {
  const formData = new FormData();

  formData.append("sell_method_id", String(payload.sell_method_id));
  formData.append("currency_id",    String(payload.currency_id));

  // ✅ Guard against null/undefined field_values
  Object.entries(payload.field_values ?? {}).forEach(([key, val]) => {
    formData.append(`field_values[${key}]`, val);
  });

  if (payload.remarks?.trim()) {
    formData.append("remarks", payload.remarks.trim());
  }

  if (payload.qr_code) {
    formData.append("qr_code", payload.qr_code);
  }

  const response = await apiClient.post("/user/payment-methods", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response?.data;
};

/**
 * PUT /user/payment-methods/:id
 * Updates an existing payment method.
 */
  export const updateUserPaymentMethod = async (
  id: number,
  payload: {
    sell_method_id?: number;
    currency_id?: number;
    field_values?: Record<string, string>;
    remarks?: string;
    qr_code?: File | null;
  }
) => {
  const formData = new FormData();

  formData.append("_method", "PUT");

  if (payload.sell_method_id !== undefined) {
    formData.append("sell_method_id", String(payload.sell_method_id));
  }
  if (payload.currency_id !== undefined) {
    formData.append("currency_id", String(payload.currency_id));
  }

  // ✅ Guard against null/undefined field_values
  Object.entries(payload.field_values ?? {}).forEach(([key, val]) => {
    formData.append(`field_values[${key}]`, val);
  });

  if (payload.remarks?.trim()) {
    formData.append("remarks", payload.remarks.trim());
  }

  if (payload.qr_code) {
    formData.append("qr_code", payload.qr_code);
  }

  const response = await apiClient.post(`/user/payment-methods/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response?.data;
};

/**
 * DELETE /user/payment-methods/:id
 * Soft-deletes (deactivates) a payment method.
 */
export const deleteUserPaymentMethod = async (id: number) => {
  const response = await apiClient.delete(`/user/payment-methods/${id}`);
  return response?.data;
};

// add security money for ad creation
export const addSecurityMoney = async (payload: {
  amount: number;
}) => {
  const response = await apiClient.post("/user/add-security-deposit", payload);
  return response?.data;
}