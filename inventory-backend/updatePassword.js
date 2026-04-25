const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const updatePassword = async () => {
  try {
    const user = await User.findOne({ email: "admin@gmail.com" });

    if (!user) {
      console.log("User not found");
      process.exit();
    }

    user.password = "admin123"; // 👈 your new password
    await user.save(); // 🔥 triggers bcrypt hashing

    console.log("Password updated successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

updatePassword();
