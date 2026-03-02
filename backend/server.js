import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import expenseRoutes from "./routes/expenseRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import incomeRoutes   from "./routes/incomeRoutes.js";
import netWorthRoutes from "./routes/netWorthRoutes.js";
import goalRoutes     from "./routes/goalRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use(express.json());

app.use("/api/expenses", expenseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/income",   incomeRoutes);
app.use("/api/networth", netWorthRoutes);
app.use("/api/goals",    goalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
console.log("Current directory:", process.cwd());
console.log("Env loaded EMAIL_USER:", process.env.EMAIL_USER);