const Order = require("../models/Order");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const discountService = require("./discount.service");
const loyaltyService = require("./loyalty.service");
const orderItemService = require("./orderItem.service");
const variantService = require("./variant.service");

function calculateSubtotal(cartItems) {
  return cartItems.reduce((sum, item) => sum + item.variantId.price * item.quantity, 0);
}

async function checkout({ userId, addressId, paymentMethod, discountCode, pointsToRedeem = 0, deliveryFee = 0 }) {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new Error("Cart not found.");
  }

  const cartItems = await CartItem.find({ cartId: cart._id }).populate("variantId");
  if (!cartItems.length) {
    throw new Error("Cart is empty.");
  }

  for (const item of cartItems) {
    const inStock = await variantService.isInStock(item.variantId._id, item.quantity);
    if (!inStock) {
      throw new Error(`Insufficient stock for variant ${item.variantId._id}.`);
    }
  }

  const subTotal = calculateSubtotal(cartItems);

  let discount = null;
  let discountAmount = 0;
  if (discountCode) {
    discount = await discountService.validateDiscount(discountCode, userId);
    discountAmount = subTotal * (discount.discountValue / 100);
  }
  const amountAfterDiscount = Math.max(subTotal - discountAmount, 0);

  const pointsDeduction = await loyaltyService.calculateRedemptionValue(pointsToRedeem, userId);
  const amountAfterPoints = Math.max(amountAfterDiscount - pointsDeduction, 0);

  const totalAmount = amountAfterPoints + deliveryFee;

  const order = await Order.create({
    userId,
    addressId,
    orderStatus: "pending",
    paymentMethod,
    subTotal,
    discountId: discount ? discount._id : undefined,
    discountAmount,
    deliveryFee,
    totalAmount,
  });

  await orderItemService.createOrderItems(order._id, cartItems);

  for (const item of cartItems) {
    await variantService.decrementStock(item.variantId._id, item.quantity);
  }

  if (discount) {
    await discountService.incrementUsage(discount._id);
  }

  if (pointsToRedeem) {
    await loyaltyService.redeemPoints(userId, pointsToRedeem);
  }
  await loyaltyService.earnPoints(userId, amountAfterPoints);

  await CartItem.deleteMany({ cartId: cart._id });

  return order;
}

async function updateOrderStatus(orderId, status) {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus: status },
    { new: true, runValidators: true },
  );
  if (!order) {
    throw new Error("Order not found.");
  }
  return order;
}

async function getUserOrders(userId) {
  return Order.find({ userId }).sort({ createdAt: -1 });
}

async function getOrderById(orderId, userId) {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    throw new Error("Order not found.");
  }
  return order;
}

async function cancelOrder(orderId, userId) {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    throw new Error("Order not found.");
  }
  if (order.orderStatus === "cancelled") {
    throw new Error("Order is already cancelled.");
  }
  if (["shipped", "delivered"].includes(order.orderStatus)) {
    throw new Error("Order can no longer be cancelled.");
  }

  order.orderStatus = "cancelled";
  return order.save();
}

module.exports = {
  calculateSubtotal,
  checkout,
  updateOrderStatus,
  getUserOrders,
  getOrderById,
  cancelOrder,
};
