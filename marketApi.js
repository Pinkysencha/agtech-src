import axios from 'axios';

const BASE_URL = import.meta.env.VITE_CEDA_API_URL;
const API_KEY = import.meta.env.VITE_CEDA_API_KEY;

const cedaApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Cache so we don't re-fetch these lookup lists on every call
let commoditiesCache = null;
let geographiesCache = null;

// 1. Get list of all commodities (id + name)
export const getCommodities = async () => {
  if (commoditiesCache) return commoditiesCache;
  const res = await cedaApi.get('/agmarknet/commodities');
  commoditiesCache = res.data.commodities;
  return commoditiesCache;
};

// 2. Get list of all states/districts
export const getGeographies = async () => {
  if (geographiesCache) return geographiesCache;
  const res = await cedaApi.get('/agmarknet/geographies');
  geographiesCache = res.data;
  return geographiesCache;
};

// Helper: find a commodity's ID by name (e.g. "Wheat")
const findCommodityId = async (name) => {
  const commodities = await getCommodities();
  const match = commodities.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  if (!match) throw new Error(`Commodity "${name}" not found`);
  return match.id;
};

// 3. Get prices for a commodity, optionally scoped to a state
export const getMarketPrices = async ({
  commodityName = 'Wheat',
  stateId = null,
  districtIds = [],
  marketIds = [],
  fromDate,
  toDate,
} = {}) => {
  const commodityId = await findCommodityId(commodityName);

  // Default to the last 30 days if no dates given
  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(today.getDate() - 30);

  const body = {
    commodity_id: commodityId,
    ...(stateId && { state_id: stateId }),
    ...(districtIds.length && { district_id: districtIds }),
    ...(marketIds.length && { market_id: marketIds }),
    from_date: fromDate || monthAgo.toISOString().split('T')[0],
    to_date: toDate || today.toISOString().split('T')[0],
  };

  const res = await cedaApi.post('/agmarknet/prices', body);
  return res.data;
};