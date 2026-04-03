import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin Analytics
export const getDashboardStats = () => api.get('/admin/dashboard/stats');
export const getDashboardChart = () => api.get('/admin/dashboard/sales-chart');

// Product APIs
export const getProducts = (params) => api.get('/admin/products', { params });
export const addProduct = (productData) => api.post('/admin/products', productData); 
export const updateProduct = (id, productData) => api.put(`/admin/products/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/admin/products/${id}`);
export const getCategoriesAdmin = () => api.get('/categories');
export const getBrandsAdmin = () => api.get('/brands'); 

// Order APIs
export const getAllOrders = (params) => api.get('/admin/orders', { params });
export const updateOrderStatus = (id, status) => api.put(`/admin/orders/${id}/status`, { status });

// Image Upload API
export const uploadImage = (formData) => api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export default api;
