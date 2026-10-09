import apiClient from "@/utils/apiClient";

export const GetUserApi = async (params: { userId: string }) => {
    const response = await apiClient.get(`/user/wallet-transfer/user/${params.userId}`);
    return response.data;
};

export const WalletTransferApi = async (data: { receiver_id: string; amount: number }) => {
    const response = await apiClient.post("/user/wallet-transfer", data);
    return response.data;
};

export const GetWalletTransferListApi = async (params: any) => {
    const response = await apiClient.get("/user/wallet-transfer", params);
    return response.data;
};


// E-voucher related APIs
export const GenerateEVoucherApi = async (data: { amount: number }) => {    
    const response = await apiClient.post("/user/evoucher-transfer", data);
    return response.data;
};

export const GetEVoucherListApi = async (params: any) => {
    const response = await apiClient.get("/user/evoucher-transfer/history", params);
    return response.data;
};

export const RedeemEVoucherApi = async (data: { code: string }) => {
    const response = await apiClient.post("/user/evoucher-transfer/redeem", data);
    return response.data;
};

export const GetTransferListApi = async (params: any) => {
    const response = await apiClient.get("/user/transaction-list", params);
    return response.data;
};

export const GetCurrencyLimitApi = async (params: { currency: string; order_type?: 'buy' | 'sell' }) => {
    const response = await apiClient.get("/user/currency-limit", { params });
    return response.data;
};


