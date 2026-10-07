import { useState } from 'react';
import { gradeWheatImage } from './api/gradingApi';

function GradingTest() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await gradeWheatImage(file);
      setResult(data);
    } catch (err) {
      console.error('Grading failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Grain Grading</h2>
      <input type="file" accept="image/*" onChange={handleUpload} />

      {loading && <p>Grading in progress...</p>}

      {result && (
        <div style={{ marginTop: '1rem' }}>
          <p><strong>Grade:</strong> {result.grade}</p>
          <p><strong>Healthy Grains:</strong> {result.healthyGrains}</p>
          <p><strong>Damaged Grains:</strong> {result.damagedGrains}</p>
          <p><strong>Impurities:</strong> {result.impurities}</p>
          <p><strong>Price Multiplier:</strong> {result.priceMultiplier}x</p>
        </div>
      )}
    </div>
  );
}

export default GradingTest;