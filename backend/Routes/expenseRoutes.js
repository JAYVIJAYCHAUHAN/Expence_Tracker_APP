const express = require("express");
const { createExpense, getExpenses, updateExpense, deleteExpense } = require("../Controllers/expenseController");
const auth = require("../middleware/auth");

const router = express.Router();

// All routes are protected with authentication
router.use(auth);

// CRUD routes
router.post("/", createExpense);
router.get("/", getExpenses);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router; 