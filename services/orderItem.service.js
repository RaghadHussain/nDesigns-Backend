const OrderItem = require("../models/OrderItem");

async function createOrderItems(orderId, cartItems) {
  const orderItemsData = cartItems.map((item) => ({
    orderId,
    variantId: item.variantId._id,
    quantity: item.quantity,
    totalPrice: item.variantId.price * item.quantity,
  }));

  return OrderItem.insertMany(orderItemsData);
}

async function getOrderItems(orderId) {
  return OrderItem.find({ orderId }).populate("variantId");
}

module.exports = {
  createOrderItems,
  getOrderItems,
};
