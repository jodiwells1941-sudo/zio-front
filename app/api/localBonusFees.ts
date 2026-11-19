import apiClient from '@/utils/apiClient';

export const getLocalBonusFeesSettings = async () => {
  const response = await apiClient.get('/user/local-buy-sell/bonus-fees');
  return response.data;
};

export const getLocalBuyAdBonusTiers = async () => {
  const response = await getLocalBonusFeesSettings();
  return { ...response, data: response.data?.buy_ad_bonus_tiers ?? [] };
};

export const getLocalBuyAdBonusPreview = async (amount: number) => {
  const response = await apiClient.get('/user/local-buy-sell/bonus-preview', { params: { amount } });
  return response.data;
};
