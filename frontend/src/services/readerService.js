import api from './api';

export const readerService = {
  getAll: (params) => api.get('/readers', { params }),
  getById: (id) => api.get(`/readers/${id}`),
  create: (data) => api.post('/readers', data),
  update: (id, data) => api.put(`/readers/${id}`, data),
  delete: (id) => api.delete(`/readers/${id}`),
};

export default readerService;
