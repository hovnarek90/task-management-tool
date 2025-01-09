const express = require("express");
const Task = require("../models/Task");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.get(
  "/client",
//   authenticate,
//   authorizeRoles("Admin", "Manager", "User"),
  async (req, res) => {
    try {
      const tasks = await Task.find().populate("assignedUser", "username");
      console.log(tasks);

      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.get("/my-tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/client", async (req, res) => {
  const { title, description, priority, dueDate, assignedUser } = req.body;
  try {
    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      assignedUser,
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (req.user.role === "Manager") {
      const { title, description, priority, dueDate, assignedUser } = req.body;
      task.title = title || task.title;
      task.description = description || task.description;
      task.priority = priority || task.priority;
      task.dueDate = dueDate || task.dueDate;
      task.assignedUser = assignedUser || task.assignedUser;
    } else if (
      req.user.role === "User" &&
      task.assignedUser.toString() === req.user.id
    ) {
      const { status } = req.body;
      task.status = status || task.status;
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete(
  "/:id",
//   authenticate,
//   authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json({ message: "Task deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
