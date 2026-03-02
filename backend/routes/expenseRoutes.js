import express from "express";
import {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getCategoryAnalytics,
  helpExpense
} from "../controllers/expenseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE
router.post("/",protect, addExpense);

// READ (category + date filters)
router.get("/", protect,getExpenses);

// ANALYTICS  (⚠️ must be before :id routes)
router.get("/analytics/category",protect, getCategoryAnalytics);

// HELP (optional test route)
router.get("/help", protect,helpExpense);

// UPDATE
router.put("/:id",protect, updateExpense);

// DELETE
router.delete("/:id", protect,deleteExpense);

export default router;
