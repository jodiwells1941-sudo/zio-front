import apiClient from '@/utils/apiClient';

export type LocalBonusTier = {
  id: number;
  min_amount: number | string;
  max_amount: number | string | null;
  bonus_type: 'fixed' | 'percentage';
  bonus_value: number | string;
  is_active: boolean;
  priority: number;
};

/** Match the server's active-tier priority and cents rounding for previews. */
export const calculateLocalBuyBonus = (amount: number, tiers: LocalBonusTier[]) => {
  const tier = [...tiers]
    .filter(item => item.is_active && amount >= Number(item.min_amount)
      && (item.max_amount == null || amount <= Number(item.max_amount)))
    .sort((a, b) => Number(b.priority) - Number(a.priority) || Number(b.min_amount) - Number(a.min_amount))[0];
  const raw = tier?.bonus_type === 'percentage'
    ? amount * Number(tier.bonus_value) / 100
    : Number(tier?.bonus_value ?? 0);

  return {
    amount: Number.isFinite(raw) && raw > 0 ? Math.round((raw + Number.EPSILON) * 100) / 100 : 0,
    percent: tier?.bonus_type === 'percentage' ? Number(tier.bonus_value) : null,
    type: tier?.bonus_type ?? null,
  };
};

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
