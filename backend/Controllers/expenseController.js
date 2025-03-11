const Expense = require("../Models/Expense");

// Create new expense
exports.createExpense = async (req, res) => {
  try {
    const { amount, description, category, date } = req.body;
    const userId = req.user.id; // Will be set by auth middleware

    const expense = new Expense({
      userId,
      amount,
      description,
      category,
      date
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating expense" });
  }
};

// Get all expenses for a user
exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching expenses" });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, category, date } = req.body;
    const userId = req.user.id;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId },
      { amount, description, category, date },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating expense" });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await Expense.findOneAndDelete({ _id: id, userId });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting expense" });
  }
}; 