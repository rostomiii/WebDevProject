import mongoose from "mongoose";
import User from "../models/user.model.js";

const publicUser = (user) => ({
  _id: user._id, name: user.name, email: user.email,
  createdAt: user.createdAt, updatedAt: user.updatedAt
});

const sendError = (res, err) => {
  if (err.code === 11000) return res.status(409).json({ message: "Email already exists" });
  if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
};

const create = async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (typeof name !== "string" || !name.trim() ||
        typeof email !== "string" || !email.trim() ||
        typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Provide name, email, and a password of at least 8 characters" });
    }
    const user = new User({ name, email });
    await user.setPassword(password);
    await user.save();
    return res.status(201).json(publicUser(user));
  } catch (err) { return sendError(res, err); }
};

const list = async (_req, res) => {
  try {
    const users = await User.find().select("name email createdAt updatedAt");
    return res.json(users);
  } catch (err) { return sendError(res, err); }
};

const userByID = async (req, res, next, id) => {
  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    req.profile = user;
    return next();
  } catch (err) { return next(err); }
};

const read = (req, res) => res.json(publicUser(req.profile));

const update = async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (name === undefined && email === undefined && password === undefined) {
      return res.status(400).json({ message: "No supported fields to update" });
    }
    const user = await User.findById(req.profile._id).select("+hashed_password +salt");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) return res.status(400).json({ message: "Invalid name" });
      user.name = name;
    }
    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) return res.status(400).json({ message: "Invalid email" });
      user.email = email;
    }
    if (password !== undefined) await user.setPassword(password);
    await user.save();
    return res.json(publicUser(user));
  } catch (err) {
    if (err.message === "Password must be at least 8 characters") {
      return res.status(400).json({ message: err.message });
    }
    return sendError(res, err);
  }
};

const remove = async (req, res) => {
  try {
    await User.deleteOne({ _id: req.profile._id });
    return res.json({ message: "User deleted successfully" });
  } catch (err) { return sendError(res, err); }
};

export default { create, list, userByID, read, update, remove };
