import express from "express";
import { getNetWorth, addNetWorthItem, updateNetWorthItem, deleteNetWorthItem } from "../controllers/netWorthController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",       protect, getNetWorth);
router.post("/",      protect, addNetWorthItem);
router.put("/:id",    protect, updateNetWorthItem);
router.delete("/:id", protect, deleteNetWorthItem);

export default router;