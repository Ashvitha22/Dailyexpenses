import axios from "axios";

// Change this only if your backend URL changes
const API_BASE_URL = "http://localhost:5000/api/expenses";

/**
 * Get all expenses
 * Supports filters: category, startDate, endDate
 */
export const getExpenses = async (params = {}) => {
  return axios.get(API_BASE_URL, { params });
};

/**
 * Add new expense
 * data: { title, amount, category, date? }
 */
export const addExpense = async (data) => {
  return axios.post(API_BASE_URL, data);
};

/**
 * Update an expense
 */
export const updateExpense = async (id, data) => {
  return axios.put(`${API_BASE_URL}/${id}`, data);
};

/**
 * Delete an expense
 */
export const deleteExpense = async (id) => {
  return axios.delete(`${API_BASE_URL}/${id}`);
};

/**
 * Get category-wise analytics
 */
export const getAnalytics = async () => {
  return axios.get(`${API_BASE_URL}/analytics/category`);
};
