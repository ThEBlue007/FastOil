// Central API utility — ทุก request ผ่านที่นี่
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request(path, options = {}) {
  const token = localStorage.getItem('fastoil_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด')
  return data
}

export const api = {
  // Auth
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  verifyEmail: (body) => request('/api/auth/verify-email', { method: 'POST', body: JSON.stringify(body) }),
  resendEmailOtp: (body) => request('/api/auth/resend-email-otp', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  sendPhoneOtp: (body) => request('/api/auth/send-phone-otp', { method: 'POST', body: JSON.stringify(body) }),
  verifyPhone: (body) => request('/api/auth/verify-phone', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/api/auth/me'),
  updateProfile: (body) => request('/api/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) => request('/api/auth/change-password', { method: 'PUT', body: JSON.stringify(body) }),
  refreshToken: (body) => request('/api/auth/refresh', { method: 'POST', body: JSON.stringify(body) }),

  // Orders
  getOrders: () => request('/api/orders'),
  createOrder: (body) => request('/api/orders', { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  getAdminStats: () => request('/api/admin/stats'),
  getAdminUsers: (params = '') => request(`/api/admin/users${params}`),
  changeUserRole: (id, role) => request(`/api/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  banUser: (id, banned) => request(`/api/admin/users/${id}/ban`, { method: 'PUT', body: JSON.stringify({ banned }) }),

  deleteUser: (id) => request(`/api/admin/users/${id}`, { method: 'DELETE' }),
  bulkDeleteUsers: (userIds) => request('/api/admin/users/bulk-delete', { method: 'POST', body: JSON.stringify({ userIds }) }),

  getAdminOrders: (params = '') => request(`/api/admin/orders${params}`),

  updateOrderStatus: (id, status, cancel_reason = null) => request(`/api/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, cancel_reason }) }),
  deleteOrder: (id) => request(`/api/admin/orders/${id}`, { method: 'DELETE' }),

  getActivityLogs: (params = '') => request(`/api/admin/logs${params}`),
  
  // Logs
  reportError: (body) => request('/api/logs/report', { method: 'POST', body: JSON.stringify(body) }).catch(err => console.warn('Error reporting failed:', err)),
}