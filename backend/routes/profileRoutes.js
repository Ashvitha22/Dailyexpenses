import express from "express";
import {
  getProfile,
  updateProfile
} from "../controllers/profileControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);

export default router;
