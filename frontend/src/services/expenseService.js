import api from "./api";

/**
 * Get all expenses
 */
export const getExpenses = (params = {}) => {
  return api.get("/expenses", { params });
};

/**
 * Add new expense
 */
export const addExpense = (data) => {
  return api.post("/expenses", data);
};

/**
 * Update expense
 */
export const updateExpense = (id, data) => {
  return api.put(`/expenses/${id}`, data);
};

/**
 * Delete expense
 */
export const deleteExpense = (id) => {
  return api.delete(`/expenses/${id}`);
};

/**
 * Get analytics
 */
export const getAnalytics = () => {
  return api.get("/expenses/analytics/category");
};
