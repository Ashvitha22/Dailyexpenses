import Expense from "../models/Expense.js";

/**
 * CREATE
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
      date
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * READ + FILTER (category + date)
 */
export const getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;

    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE
 */
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE
 */
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

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
 * ANALYTICS
 */
export const getCategoryAnalytics = async (req, res) => {
  try {
    const analytics = await Expense.aggregate([
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const overallTotal = analytics.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );

    res.status(200).json({
      overallTotal,
      categoryAnalytics: analytics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * HELP TEST ROUTE
 */
export const helpExpense = (req, res) => {
  res.json({ success: true, message: "Expense API working" });
};
