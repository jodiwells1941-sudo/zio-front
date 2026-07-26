import apiClient from "@/utils/apiClient";

export const SubmitDepositWithdrawApi = async (data: unknown) => {
    const response = await apiClient.post("/user/binance", data);
    return response.data;
};

export const SubmitInitialDepositApi = async (data: unknown) => {
  return (await apiClient.post("/user/binance/deposit/initiate", data)).data;
};

export const VerifyDepositApi = async (data: unknown) => {
    return (await apiClient.post("/user/binance/deposit/verify", data)).data;
};

export const GetDepositInfoApi = async (token: string) => {
    return (await apiClient.get("/user/binance/deposit/info", { params: { token } })).data;
};

export const SubmitBinanceDepositApi = async (data: { binance_id: string; amount: number, payment_method: string  }) => {
  return (await apiClient.post("/user/binance/deposit/initiate", data)).data;
};

export const depositWithdrawHistoryApi = async () => {
    return (await apiClient.get("/user/binance/list")).data;
};

export const depositSupportApi = async (payload: {
  deposit_id: string;
  tx_id: string;
  paid_amount: string;
  file?: File;
  note?: string;
}) => {
  const formData = new FormData();
  formData.append("deposit_id", payload.deposit_id);
  formData.append("tx_id", payload.tx_id);
  formData.append("paid_amount", payload.paid_amount);
  if (payload.note) formData.append("note", payload.note);
  if (payload.file) formData.append("file", payload.file);

  const res = await apiClient.post("/user/binance/deposit-support", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // { error, message, data }
};

export const depositListApi = async () => {
    return (await apiClient.get("/user/binance/deposit/list")).data;
};



