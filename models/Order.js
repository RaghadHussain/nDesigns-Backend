const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    discountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
