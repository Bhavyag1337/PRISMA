import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyticsService = {
  getDashboardSummary: () => api.get('/analytics/dashboard/summary'),
  getCustomerAnalytics: (id) => api.get(`/analytics/customers/${id}`),
};

export const inventoryService = {
  getAlerts: () => api.get('/inventory/alerts'),
  getDemandForecast: (id) => api.get(`/inventory/products/${id}/demand`),
  updatePrice: (id, price) => api.get(`/inventory/products/${id}/update-price`, { params: { new_price: price } }),
};

export const ingestService = {
  ingestData: (data) => api.post('/ingest-data', data),
};

export const recommendationService = {
  getRecommendations: (customerId) => api.get(`/recommendations/${customerId}`),
};

export default api;
