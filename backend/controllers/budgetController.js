import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";

/**
 * Create or Update Budget
 */
export const setBudget = async (req, res) => {
  try {
    const { category, amount } = req.body;

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user._id, // ✅ FIX
        category,
        month,
        year
      },
      { amount },
      { new: true, upsert: true }
    );

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: "Failed to set budget" });
  }
};

/**
 * Get Budgets with spent amount
 */
export const getBudgets = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const budgets = await Budget.find({
      user: req.user._id, // ✅ FIX
      month,
      year
    });

    const expenses = await Expense.aggregate([
      {
        $match: {
          user: req.user._id, // ✅ FIX
          date: {
            $gte: new Date(year, month, 1),
            $lt: new Date(year, month + 1, 1)
          }
        }
      },
      {
        $group: {
          _id: "$category",
          totalSpent: { $sum: "$amount" }
        }
      }
    ]);

    const spentMap = {};
    expenses.forEach(e => {
      spentMap[e._id] = e.totalSpent;
    });

    const result = budgets.map(b => {
      const spent = spentMap[b.category] || 0;
      const remaining = b.amount - spent;

      return {
        ...b.toObject(),
        spent,
        remaining,
        message:
          remaining > 0
            ? `₹${remaining} remaining to spend`
            : "⚠️ Budget exceeded"
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch budgets" });
  }
};
