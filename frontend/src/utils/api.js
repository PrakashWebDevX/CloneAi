const BASE = 'https://cloneai-backend.onrender.com/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  chat: (body) => request('/chat', { method: 'POST', body }),
  analyze: (text) => request('/analyze', { method: 'POST', body: { text } }),
  getPersonalities: (sessionId) => request(`/personalities?sessionId=${sessionId}`),
  createPersonality: (sessionId, personality) =>
    request('/personalities', { method: 'POST', body: { sessionId, personality } }),
  deletePersonality: (id) => request(`/personalities/${id}`, { method: 'DELETE' }),
  updatePersonality: (id, updates) =>
    request(`/personalities/${id}`, { method: 'PUT', body: updates }),
  health: () => request('/health')
};