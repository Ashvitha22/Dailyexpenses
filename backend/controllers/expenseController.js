import Expense from "../models/Expense.js";

/**
 * @desc    Add new expense (USER-SPECIFIC)
 * @route   POST /api/expenses
 * @access  Private
 */


export const addExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    const expense = await Expense.create({
      title,
      amount,
      category,
      date: date ? new Date(date) : new Date(),
      user: req.user._id
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * @desc    Get expenses of logged-in user (with optional category filter)
 * @route   GET /api/expenses
 * @access  Private
 */
export const getExpenses = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { user: req.user._id };

    if (category) {
      filter.category = category;
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update expense (ONLY if it belongs to user)
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id, // 🔐 ownership check
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.title = req.body.title ?? expense.title;
    expense.amount = req.body.amount ?? expense.amount;
    expense.category = req.body.category ?? expense.category;
    expense.date = req.body.date ?? expense.date;

    const updatedExpense = await expense.save();

    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete expense (ONLY if it belongs to user)
 * @route   DELETE /api/expenses/:id
 * @access  Private
 */
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id, // 🔐 ownership check
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await expense.deleteOne();

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Category-wise analytics (USER-SPECIFIC)
 * @route   GET /api/expenses/analytics/category
 * @access  Private
 */
export const getCategoryAnalytics = async (req, res) => {
  try {
    const analytics = await Expense.aggregate([
      {
        $match: {
          user: req.user._id, // 🔐 filter by user
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    const overallTotal = analytics.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );

    res.status(200).json({
      overallTotal,
      categoryAnalytics: analytics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Test route
 * @route   GET /api/expenses/help
 * @access  Private
 */
export const helpExpense = (req, res) => {
  res.json({ success: true, message: "Expense API working" });
};
