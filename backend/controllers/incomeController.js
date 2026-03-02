import Income from "../models/Income.js";

// GET /api/income
export const getIncome = async (req, res) => {
  try {
    const entries = await Income.find({ user: req.user._id }).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/income
export const addIncome = async (req, res) => {
  try {
    const { label, amount, category, frequency, date, note } = req.body;
    if (!label || !amount || !category)
      return res.status(400).json({ message: "label, amount and category are required" });

    const entry = await Income.create({
      user: req.user._id,
      label, amount, category,
      frequency: frequency || "monthly",
      date: date || Date.now(),
      note: note || "",
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/income/:id
export const updateIncome = async (req, res) => {
  try {
    const entry = await Income.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    const { label, amount, category, frequency, date, note } = req.body;
    if (label)     entry.label     = label;
    if (amount)    entry.amount    = amount;
    if (category)  entry.category  = category;
    if (frequency) entry.frequency = frequency;
    if (date)      entry.date      = date;
    if (note !== undefined) entry.note = note;

    const updated = await entry.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/income/:id
export const deleteIncome = async (req, res) => {
  try {
    const entry = await Income.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    res.json({ message: "Income entry deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};