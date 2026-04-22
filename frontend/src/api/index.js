const BASE = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const authAPI = {
  register: (data) =>
    fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  login: (data) =>
    fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  me: () =>
    fetch(`${BASE}/auth/me`, { headers: headers() }).then((r) => r.json()),
};

export const expenseAPI = {
  getAll: () =>
    fetch(`${BASE}/expenses`, { headers: headers() }).then((r) => r.json()),

  add: (data) =>
    fetch(`${BASE}/expenses`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  delete: (id) =>
    fetch(`${BASE}/expenses/${id}`, {
      method: "DELETE",
      headers: headers(),
    }).then((r) => r.json()),

  update: (id, data) =>
    fetch(`${BASE}/expenses/${id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateBudget: (budget) =>
    fetch(`${BASE}/expenses/budget`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ budget }),
    }).then((r) => r.json()),
};
export const aiAPI = {
  getInsights: (data) =>
    fetch(`${BASE}/ai/insights`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  chat: (data) =>
    fetch(`${BASE}/ai/chat`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),
};
