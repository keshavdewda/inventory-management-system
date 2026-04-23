const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- DEBUG START ---
    const mongoUri = process.env.MONGO_URI || "";
    const dbName = mongoUri.split("/").pop()?.split("?")[0] || "unknown";
    console.log("[DEBUG] DB in use:", dbName);
    console.log("[DEBUG] Email received:", email);
    // --- DEBUG END ---

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // --- DEBUG START ---
    console.log("[DEBUG] User found:", user ? { id: user._id, email: user.email, role: user.role, hasPassword: !!user.password } : null);
    // --- DEBUG END ---

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // --- DEBUG START ---
    console.log("[DEBUG] Password match:", isMatch);
    // --- DEBUG END ---

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("[DEBUG] Login error:", error.message);
    res.status(500).json({ message: "Login failed" });
  }
};

module.exports = { login };
