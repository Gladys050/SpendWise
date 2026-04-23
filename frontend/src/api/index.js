const BASE_URL =
  import.meta.env.VITE_API_URL || "https://spendwise-2f4i.onrender.com";
const BASE = `${BASE_URL}/api`;

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const parseJson = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const request = async (path, options = {}) => {
  try {
    const response = await fetch(`${BASE}${path}`, {
      mode: "cors",
      headers: headers(),
      ...options,
    });
    const data = await parseJson(response);
    if (response.ok) {
      return data;
    }
    return {
      success: false,
      message: data.message || `${response.status} ${response.statusText}`,
    };
  } catch (error) {
    return {
      success: false,
      message: "Unable to reach the API server.",
    };
  }
};

export const authAPI = {
  register: (data) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => request("/auth/me"),
};

export const expenseAPI = {
  getAll: () => request("/expenses"),

  add: (data) =>
    request("/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    request(`/expenses/${id}`, {
      method: "DELETE",
    }),

  update: (id, data) =>
    request(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  updateBudget: (budget) =>
    request("/expenses/budget", {
      method: "PUT",
      body: JSON.stringify({ budget }),
    }),
};

export const aiAPI = {
  getInsights: (data) =>
    request("/ai/insights", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  chat: (data) =>
    request("/ai/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
