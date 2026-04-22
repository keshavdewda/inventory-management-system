const User = require("../models/User");

const createUser = async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = req.body.password;
    const role = typeof req.body.role === "string" ? req.body.role.trim().toLowerCase() : "";

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["admin", "manager", "viewer"].includes(role)) {
      return res.status(400).json({ message: "Role must be admin, manager, or viewer" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "User creation failed" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user && String(req.user._id) === String(user._id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Cannot delete the last admin user" });
      }
    }

    await user.deleteOne();
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

module.exports = { createUser, getUsers, deleteUser };
