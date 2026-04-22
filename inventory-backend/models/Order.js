const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["purchase", "sales"],
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    categorySnapshot: {
      type: String,
      trim: true,
      default: "",
    },
    supplierSnapshot: {
      type: String,
      trim: true,
      default: "",
    },
    partner: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      trim: true,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalValue: {
      type: Number,
      required: true,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
