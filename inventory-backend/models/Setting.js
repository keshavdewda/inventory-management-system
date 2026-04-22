const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "global",
      unique: true,
      immutable: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: "Nova Inventory Co.",
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "INR"],
      default: "INR",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);

