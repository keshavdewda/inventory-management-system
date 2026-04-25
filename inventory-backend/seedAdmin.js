const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const createAdmin = async () => {
  try {
    const email = "admin@gmail.com";

    await User.deleteOne({ email });

    await User.create({
      name: "Admin",
      email,
      password: "admin123",
      role: "admin",
    });

    console.log("✅ Admin created — email: admin@gmail.com | password: admin123");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();
