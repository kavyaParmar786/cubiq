// ── Cubiq Host API Client ─────────────────────────────────────
// Centralized API calls with token management

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Get stored token
function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('cubiq_token')
}

// Store token
export function setToken(token: string) {
  localStorage.setItem('cubiq_token', token)
}

// Remove token (logout)
export function clearToken() {
  localStorage.removeItem('cubiq_token')
  localStorage.removeItem('cubiq_user')
}

// Base fetch with auth header
async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`)
  }

  return data
}

// ── Auth API ──────────────────────────────────────────────────
export const authApi = {
  register: (body: { username: string; email: string; password: string }) =>
    apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  me: () => apiFetch('/api/auth/me'),

  forgotPassword: (email: string) =>
    apiFetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string) =>
    apiFetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
}

// ── Servers API ───────────────────────────────────────────────
export const serversApi = {
  getAll: () => apiFetch('/api/servers'),

  getOne: (id: string) => apiFetch(`/api/servers/${id}`),

  create: (body: { name: string; type: string; version: string; planId: string }) =>
    apiFetch('/api/servers', { method: 'POST', body: JSON.stringify(body) }),

  power: (id: string, action: 'start' | 'stop' | 'restart' | 'kill') =>
    apiFetch(`/api/servers/${id}/power`, { method: 'POST', body: JSON.stringify({ action }) }),

  delete: (id: string) =>
    apiFetch(`/api/servers/${id}`, { method: 'DELETE' }),
}

// ── Tickets API ───────────────────────────────────────────────
export const ticketsApi = {
  getAll: () => apiFetch('/api/tickets'),

  create: (body: { subject: string; message: string; priority?: string; category?: string }) =>
    apiFetch('/api/tickets', { method: 'POST', body: JSON.stringify(body) }),

  reply: (id: string, message: string) =>
    apiFetch(`/api/tickets/${id}/reply`, { method: 'POST', body: JSON.stringify({ message }) }),

  close: (id: string) =>
    apiFetch(`/api/tickets/${id}/close`, { method: 'PUT' }),
}

// ── Billing API ───────────────────────────────────────────────
export const billingApi = {
  getPlans: () => apiFetch('/api/billing/plans'),

  getInvoices: () => apiFetch('/api/billing/invoices'),

  createOrder: (body: { planId: string; serverId?: string }) =>
    apiFetch('/api/billing/order', { method: 'POST', body: JSON.stringify(body) }),

  verifyPayment: (body: {
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
  }) => apiFetch('/api/billing/verify', { method: 'POST', body: JSON.stringify(body) }),
}

// ── Bots API ──────────────────────────────────────────────────
export const botsApi = {
  getAll: () => apiFetch('/api/bots'),

  create: (body: { name: string; runtime: string; startCommand: string; planId?: string }) =>
    apiFetch('/api/bots', { method: 'POST', body: JSON.stringify(body) }),

  power: (id: string, action: 'start' | 'stop' | 'restart') =>
    apiFetch(`/api/bots/${id}/power`, { method: 'POST', body: JSON.stringify({ action }) }),

  delete: (id: string) =>
    apiFetch(`/api/bots/${id}`, { method: 'DELETE' }),

  updateEnv: (id: string, envVars: { key: string; value: string }[]) =>
    apiFetch(`/api/bots/${id}/env`, { method: 'PUT', body: JSON.stringify({ envVars }) }),
}

// ── Admin API ─────────────────────────────────────────────────
export const adminApi = {
  getStats: () => apiFetch('/api/admin/stats'),

  // Users
  getUsers: (params?: { search?: string; status?: string; page?: number }) => {
    const query = new URLSearchParams(params as any).toString()
    return apiFetch(`/api/admin/users${query ? `?${query}` : ''}`)
  },
  updateUserStatus: (id: string, status: string) =>
    apiFetch(`/api/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteUser: (id: string) =>
    apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' }),

  // Servers
  getServers: () => apiFetch('/api/admin/servers'),
  suspendServer: (id: string, reason?: string) =>
    apiFetch(`/api/admin/servers/${id}/suspend`, { method: 'POST', body: JSON.stringify({ reason }) }),
  unsuspendServer: (id: string) =>
    apiFetch(`/api/admin/servers/${id}/unsuspend`, { method: 'POST' }),
  deleteServer: (id: string) =>
    apiFetch(`/api/admin/servers/${id}`, { method: 'DELETE' }),

  // Plans
  getPlans: () => apiFetch('/api/admin/plans'),
  createPlan: (body: object) =>
    apiFetch('/api/admin/plans', { method: 'POST', body: JSON.stringify(body) }),
  updatePlan: (id: string, body: object) =>
    apiFetch(`/api/admin/plans/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePlan: (id: string) =>
    apiFetch(`/api/admin/plans/${id}`, { method: 'DELETE' }),

  // Tickets
  getTickets: (status?: string) =>
    apiFetch(`/api/admin/tickets${status ? `?status=${status}` : ''}`),
  replyTicket: (id: string, message: string) =>
    apiFetch(`/api/admin/tickets/${id}/reply`, { method: 'POST', body: JSON.stringify({ message }) }),
  updateTicketStatus: (id: string, status: string) =>
    apiFetch(`/api/admin/tickets/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Payments
  getPayments: () => apiFetch('/api/admin/payments'),

  // Nodes
  getNodes: () => apiFetch('/api/admin/nodes'),
  createNode: (body: object) =>
    apiFetch('/api/admin/nodes', { method: 'POST', body: JSON.stringify(body) }),
  updateNode: (id: string, body: object) =>
    apiFetch(`/api/admin/nodes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteNode: (id: string) =>
    apiFetch(`/api/admin/nodes/${id}`, { method: 'DELETE' }),
}
