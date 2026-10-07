import { backendApi } from './axiosConfig';

export const getProduceListings = async () => {
  const res = await backendApi.get('/produce');
  return res.data;
};

export const createProduceListing = async (listingData) => {
  const res = await backendApi.post('/produce', listingData);
  return res.data;
};