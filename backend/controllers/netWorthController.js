import NetWorthItem from "../models/NetWorthItem.js";

// GET /api/networth
export const getNetWorth = async (req, res) => {
  try {
    const items = await NetWorthItem.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/networth
export const addNetWorthItem = async (req, res) => {
  try {
    const { label, amount, type, category, note } = req.body;
    if (!label || !amount || !type || !category)
      return res.status(400).json({ message: "label, amount, type and category are required" });

    const item = await NetWorthItem.create({
      user: req.user._id,
      label, amount, type, category,
      note: note || "",
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/networth/:id
export const updateNetWorthItem = async (req, res) => {
  try {
    const item = await NetWorthItem.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: "Item not found" });

    const { label, amount, type, category, note } = req.body;
    if (label)    item.label    = label;
    if (amount)   item.amount   = amount;
    if (type)     item.type     = type;
    if (category) item.category = category;
    if (note !== undefined) item.note = note;

    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/networth/:id
export const deleteNetWorthItem = async (req, res) => {
  try {
    const item = await NetWorthItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};