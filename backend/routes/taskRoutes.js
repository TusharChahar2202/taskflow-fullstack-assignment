const express = require("express");
const Task = require("../models/Task");

const router = express.Router();

// @route   POST /api/tasks
// @desc    Create a new task
router.post("/", async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error.message);
    res.status(500).json({ message: "Server error while creating task" });
  }
});

// @route   GET /api/tasks
// @desc    Get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).json({ message: "Server error while fetching tasks" });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
router.put("/:id", async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, dueDate },
      { new: true } // return updated doc
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error.message);
    res.status(500).json({ message: "Server error while updating task" });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error.message);
    res.status(500).json({ message: "Server error while deleting task" });
  }
});

module.exports = router;
