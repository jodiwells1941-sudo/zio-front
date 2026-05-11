import apiClient from "@/utils/apiClient";

export const getAllActiveRounds = async () => {
  const response = await apiClient.get('/user/rounds');
  return response.data;
};

export const getAllActiveRoundsWithTickets = async () => {
  const response = await apiClient.get('/user/rounds-tickets');
  return response.data;
};

export const getTopRoundTicket = async () => {
  const response = await apiClient.get('/user/top-round');
  return response.data;
};

export const getLotteryLatestRounds = async () => {
  const response = await apiClient.get(`/user/lotteries-latest-rounds`);
  return response.data;
};

export const getLotteryLatestResults = async (page = 1) => {
  const response = await apiClient.get(`/user/lottery-latest-results?page=${page}`);
  return response.data;
};

export const getLotteryLatestOneRound = async () => {
  const response = await apiClient.get(`/user/lotteries-latest-one-round`);
  return response.data;
};

export const getLotteryWinners = async () => {
  const response = await apiClient.get(`/user/lottery-winners`);
  return response.data;
};

export const getRoundById = async (slug: string) => {
  const response = await apiClient.get(`/user/rounds/${slug}`);
  return response.data;
};

export const ticketPurchase = async (roundId: number, quantity: number) => {
  const response = await apiClient.post(`/user/rounds/${roundId}/purchase`, {
    'tickets': quantity
  });
  return response.data;
}

export const getTicketHistory = async (page = 1) => {
  const response = await apiClient.get(`/user/lottery-ticket-history?page=${page}`);
  return response.data;
}

// export const getLotterywithLastRound = async () => {
//   const response = await apiClient.get(`/user/lotteries-with-last-round`);
//   return response.data;
// };

export const getLotteryWinnersById = async (lotteryId: string) => {
  const response = await apiClient.get(`/user/lotteries/${lotteryId}/winners`);
  return response.data;
};

export const getPopularLottery = async () => {
  const response = await apiClient.get(`/user/popular-lottery-round`);
  return response.data;
};

const url = '/user/investments';

export const investmentsApi = async (page = 1) => {
    return (await apiClient.get(`all-investments?page=${page}`)).data;
};

export const investmentHistoryApi = async (page = 1) => {
    return (await apiClient.get(`${url}/history?page=${page}`)).data;
};
export const investmentPurchase = async (investmentId: string) => {
    return (await apiClient.post(url, { investment_id: investmentId })).data;
};

export const getTopOneInvestment = async () => {
    return (await apiClient.get(`/user/top-investment`)).data;
}

export const cancelInvestmentItem = async (investmentId: string) => {
    return (await apiClient.post(`/user/investments/${investmentId}/cancel`)).data;
}
