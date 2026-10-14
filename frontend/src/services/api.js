// LifeLink AI - Frontend API Service Client
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_PREFIX = `${API_BASE_URL}/api/v1`;

async function request(endpoint, options = {}) {
  const url = `${API_PREFIX}${endpoint}`;
  const token = localStorage.getItem('lifelink_id_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    headers,
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorData.detail || `HTTP Error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Emergency Lifecycle
  createEmergency: (data) => request('/emergency/create', { method: 'POST', body: JSON.stringify(data) }),
  getEmergency: (id) => request(`/emergency/${id}`),
  cancelEmergency: (id, reason, userId) => request(`/emergency/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason, user_id: userId })
  }),
  resolveEmergency: (id, notes) => request(`/emergency/${id}/resolve?notes=${encodeURIComponent(notes || '')}`, { method: 'POST' }),
  getUserEmergencies: (userId) => request(`/emergency/user/${userId}`),

  // Hospitals
  searchHospitals: (data) => request('/hospitals/search', { method: 'POST', body: JSON.stringify(data) }),
  getHospitalDetails: (id) => request(`/hospitals/${id}`),

  // Contacts
  getUserContacts: (userId) => request(`/contacts/user/${userId}`),
  addContact: (data) => request('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  deleteContact: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),
  previewAlert: (data) => request('/contacts/preview-alert', { method: 'POST', body: JSON.stringify(data) }),
  acknowledgeAlert: (data) => request('/contacts/acknowledge', { method: 'POST', body: JSON.stringify(data) }),

  // Agentic AI
  coordinateAgent: (data) => request('/agent/coordinate', { method: 'POST', body: JSON.stringify(data) }),

  // Federated Learning
  getFederatedStatus: () => request('/federated/status'),
  runFederatedExperiment: (rounds = 5) => request(`/federated/run?rounds=${rounds}`, { method: 'POST' }),

  // Analytics
  getAnalytics: () => request('/analytics/metrics'),

  // Medical Profile
  getMedicalProfile: (userId) => request(`/profile/medical/${userId}`),
  saveMedicalProfile: (data) => request('/profile/medical', { method: 'POST', body: JSON.stringify(data) }),
  deleteMedicalProfile: (userId) => request(`/profile/medical/${userId}`, { method: 'DELETE' }),
};
