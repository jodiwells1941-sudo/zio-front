import apiClient from "@/utils/apiClient";

// export const P2PTradeListAPI = async (params) => {
//     const response = await apiClient.get("/user/trade", { params });
//     return response.data;
// };

// export const P2PBuyAPI = async (data) => {
//     const response = await apiClient.post("/user/trade", data);
//     return response.data;
// };

// export const P2PSellAPI = async (data) => {
//     const response = await apiClient.post("/user/trade", data);
//     return response.data;
// };

// export const GetP2PTradeListApi = async (params) => {
//     const response = await apiClient.get("/user/trade/list", params);
//     return response.data;
// };

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
