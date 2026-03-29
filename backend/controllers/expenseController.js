const db = require("../config/db");

const getExpenses = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, created_at DESC",
      [req.user.id],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

const addExpense = async (req, res) => {
  const { description, amount, category, date } = req.body;

  if (!description || !amount || !date)
    return res
      .status(400)
      .json({ message: "Description, amount, and date are required." });

  try {
    const [result] = await db.query(
      "INSERT INTO expenses (user_id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, description, +amount, category || "other", date],
    );
    const [rows] = await db.query("SELECT * FROM expenses WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id FROM expenses WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Expense not found." });

    await db.query("DELETE FROM expenses WHERE id = ?", [req.params.id]);
    res.json({ message: "Expense deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

const updateExpense = async (req, res) => {
  const { description, amount, category, date } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT id FROM expenses WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Expense not found." });

    await db.query(
      "UPDATE expenses SET description = ?, amount = ?, category = ?, date = ? WHERE id = ?",
      [description, +amount, category, date, req.params.id],
    );
    const [updated] = await db.query("SELECT * FROM expenses WHERE id = ?", [
      req.params.id,
    ]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

const updateBudget = async (req, res) => {
  const { budget } = req.body;
  if (!budget || isNaN(budget) || +budget <= 0)
    return res.status(400).json({ message: "Valid budget amount required." });

  try {
    await db.query("UPDATE users SET budget = ? WHERE id = ?", [
      +budget,
      req.user.id,
    ]);
    res.json({ budget: +budget });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
  updateBudget,
};
