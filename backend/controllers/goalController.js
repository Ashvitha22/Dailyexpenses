import Goal from "../models/Goal.js";

// GET /api/goals
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/goals
export const addGoal = async (req, res) => {
  try {
    const { name, target, saved, deadline, icon, color, note } = req.body;
    if (!name || !target)
      return res.status(400).json({ message: "name and target are required" });

    const goal = await Goal.create({
      user: req.user._id,
      name, target,
      saved:    saved    || 0,
      deadline: deadline || null,
      icon:     icon     || "🎯",
      color:    color    || "#5EEAD4",
      note:     note     || "",
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/goals/:id
export const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const { name, target, saved, deadline, icon, color, note } = req.body;
    if (name)     goal.name     = name;
    if (target)   goal.target   = target;
    if (saved !== undefined)   goal.saved    = saved;
    if (deadline !== undefined) goal.deadline = deadline;
    if (icon)     goal.icon     = icon;
    if (color)    goal.color    = color;
    if (note !== undefined) goal.note = note;

    const updated = await goal.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/goals/:id
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};