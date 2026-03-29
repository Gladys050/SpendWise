const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
  updateBudget,
} = require("../controllers/expenseController");

router.use(auth);

router.get("/", getExpenses);
router.post("/", addExpense);
router.put("/budget", updateBudget);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;
