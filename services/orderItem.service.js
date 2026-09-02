const OrderItem = require('../models/OrderItem')

async function createOrderItems(orderId, cartItems) {
    const orderItemsData = []

    for (const item of cartItems) {
        orderItemsData.push({
            orderId,
            variantId: item.variantId._id,
            quantity: item.quantity,
            totalPrice: item.variantId.price * item.quantity
        })
    }

    return OrderItem.insertMany(orderItemsData)
}

async function getOrderItems(orderId) {
    return OrderItem.find({ orderId })
        .populate({ path: 'variantId', populate: { path: 'productId', select: 'name' } })
}

module.exports = {
    createOrderItems,
    getOrderItems
}
