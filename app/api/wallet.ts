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

export const depositWithdrawHistoryApi = async () => {
    return (await apiClient.get("/user/binance/list")).data;
};

