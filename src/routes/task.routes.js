// src/routes/task.routes.js
import { Router } from "express";
import Task from "../models/task.js"; // ✅ Updated to match your file name
import jwt from "jsonwebtoken";

const router = Router();

// Middleware to authenticate user
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Get all tasks for the logged-in user
router.get("/", auth, async (req, res, next) => {
  try {
    const tasks = await Task.find({ owner: req.userId });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// Add a new task
router.post("/", auth, async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const newTask = await Task.create({ 
      title, 
      description, 
      owner: req.userId 
    });

    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

// Update a task
router.put("/:id", auth, async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { title, description, status },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (err) {
    next(err);
  }
});

// Delete a task
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      owner: req.userId 
    });
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
