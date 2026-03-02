import api from "./api";

export const setBudget = (data) => {
  return api.post("/budgets", data);
};

export const getBudgets = () => {
  return api.get("/budgets");
};
