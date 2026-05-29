import api from './api';

export const borrowService = {
  getAll: (params) => api.get('/borrows', { params }),
  create: (data) => api.post('/borrows', data),
  returnBook: (id) => api.put(`/borrows/${id}/return`),
  extend: (id, newDueDate) => api.put(`/borrows/${id}/extend`, { newDueDate }),
  getHistory: (readerId) => api.get(`/borrows/history/${readerId}`),
  getOverdue: () => api.get('/borrows/overdue'),
};

export default borrowService;
