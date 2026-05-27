import apiClient from "@/utils/apiClient";

export const getAffiliateData = async (page: number) => {
    try {
        const response = await apiClient.get(`/user/affiliate/dashboard?page=${page}`);  
        console.log('response ==', response.data);
          
        return response.data;
    } catch (error) {
        console.error("Error fetching affiliate data:", error);
        throw error;
    }
}