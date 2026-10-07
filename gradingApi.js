import { aiApi } from './axiosConfig';

// Mock response to use until the real Flask service is reachable
const MOCK_GRADING_RESULT = {
  grade: 'A',
  healthyGrains: 187,
  damagedGrains: 8,
  impurities: 5,
  priceMultiplier: 1.15,
};

const USE_MOCK = true; // 🔁 flip this to false once Flask is running and reachable

export const gradeWheatImage = async (imageFile) => {
  if (USE_MOCK) {
    console.warn('Using MOCK grading data — Flask AI service not connected yet.');
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_GRADING_RESULT), 1000);
    });
  }

  const formData = new FormData();
  formData.append('image', imageFile);

  const res = await aiApi.post('/grade-wheat', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const checkAiHealth = async () => {
  if (USE_MOCK) {
    console.warn('Using MOCK health check — Flask AI service not connected yet.');
    return { status: 'mocked-ok' };
  }

  const res = await aiApi.get('/health');
  return res.data;
};