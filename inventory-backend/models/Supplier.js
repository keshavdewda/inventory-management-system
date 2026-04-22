const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (value) => !value || /^[+\d\s()-]{8,20}$/.test(value),
        message: "Phone number format is invalid",
      },
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
