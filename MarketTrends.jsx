import { useEffect, useState } from 'react';
import { getMarketPrices } from './api/marketApi';

function MarketTrends() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMarketPrices({ commodityName: 'Wheat' })
      .then((data) => setPrices(data.prices || data.records || []))
      .catch((err) => {
        console.error('Market data fetch failed:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading market prices...</p>;
  if (error) return <p>Could not load prices: {error}</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Wheat Market Prices</h2>
      <pre>{JSON.stringify(prices, null, 2)}</pre>
    </div>
  );
}

export default MarketTrends;