async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return body;
}

export const api = {
  meta: () => request('/api/meta'),
  createSession: (data) =>
    request('/api/sessions', { method: 'POST', body: JSON.stringify(data) }),
  getSession: (token) => request(`/api/sessions/${token}`),
  // payload: { level } for maturity questions, { text } for information ones.
  saveAnswer: (token, questionId, payload) =>
    request('/api/answers', {
      method: 'POST',
      body: JSON.stringify({ token, question_id: questionId, ...payload }),
    }),
  submit: (token) => request(`/api/sessions/${token}/submit`, { method: 'POST' }),
  results: (token) => request(`/api/results/${token}`),

  adminAuth: (password) => ({
    Authorization: `Basic ${btoa(`admin:${password}`)}`,
  }),
  adminSessions: (password) =>
    request('/api/admin/sessions', { headers: api.adminAuth(password) }),
  adminSessionDetail: (password, token) =>
    request(`/api/admin/sessions/${token}`, { headers: api.adminAuth(password) }),
  adminStats: (password) =>
    request('/api/admin/stats', { headers: api.adminAuth(password) }),
};
