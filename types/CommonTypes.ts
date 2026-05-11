export type Investment = {
  id: number;
  user_id: number;
  investment_id: number;
  investment_amount: string;
  return_amount: string;
  started_at: string;
  ended_at: string;
  closed_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  investment: {
    id: number;
    name: string;
    feature_img: string;
    duration: number;
    feature_img_url: string;
  };
};