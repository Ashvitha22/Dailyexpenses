import express from "express";
import {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getCategoryAnalytics,
  helpExpense
} from "../controllers/expenseController.js";

const router = express.Router();

// CREATE
router.post("/", addExpense);

// READ (category + date filters)
router.get("/", getExpenses);

// ANALYTICS  (⚠️ must be before :id routes)
router.get("/analytics/category", getCategoryAnalytics);

// HELP (optional test route)
router.get("/help", helpExpense);

// UPDATE
router.put("/:id", updateExpense);

// DELETE
router.delete("/:id", deleteExpense);

export default router;
