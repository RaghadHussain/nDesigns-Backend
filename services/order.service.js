const Order = require('../models/Order')
const Cart = require('../models/Cart')
const CartItem = require('../models/CartItem')
const discountService = require('./discount.service')
const loyaltyService = require('./loyalty.service')
const orderItemService = require('./orderItem.service')
const variantService = require('./variant.service')

function calculateSubtotal(cartItems) {
    let subTotal = 0
    for (const item of cartItems) {
        subTotal = subTotal + item.variantId.price * item.quantity
    }
    return subTotal
}

async function checkout(data) {
    const userId = data.userId
    const addressId = data.addressId
    const paymentMethod = data.paymentMethod
    const discountCode = data.discountCode
    let pointsToRedeem = data.pointsToRedeem
    let deliveryFee = data.deliveryFee

    if (!pointsToRedeem) {
        pointsToRedeem = 0
    }
    if (!deliveryFee) {
        deliveryFee = 0
    }

    const cart = await Cart.findOne({ userId: userId })
    if (!cart) {
        throw new Error('Cart not found.')
    }

    const cartItems = await CartItem.find({ cartId: cart._id }).populate('variantId')
    if (cartItems.length === 0) {
        throw new Error('Cart is empty.')
    }

    for (const item of cartItems) {
        const inStock = await variantService.isInStock(item.variantId._id, item.quantity)
        if (!inStock) {
            throw new Error('Insufficient stock for variant ' + item.variantId._id + '.')
        }
    }

    const subTotal = calculateSubtotal(cartItems)

    let discount = null
    let discountAmount = 0
    if (discountCode) {
        discount = await discountService.validateDiscount(discountCode, userId)
        discountAmount = subTotal * (discount.discountValue / 100)
    }

    let amountAfterDiscount = subTotal - discountAmount
    if (amountAfterDiscount < 0) {
        amountAfterDiscount = 0
    }

    const pointsDeduction = await loyaltyService.calculateRedemptionValue(pointsToRedeem, userId)

    let amountAfterPoints = amountAfterDiscount - pointsDeduction
    if (amountAfterPoints < 0) {
        amountAfterPoints = 0
    }

    const totalAmount = amountAfterPoints + deliveryFee

    const order = await Order.create({
        userId: userId,
        addressId: addressId,
        orderStatus: 'pending',
        paymentMethod: paymentMethod,
        subTotal: subTotal,
        discountId: discount ? discount._id : undefined,
        discountAmount: discountAmount,
        deliveryFee: deliveryFee,
        totalAmount: totalAmount,
    })

    await orderItemService.createOrderItems(order._id, cartItems)

    for (const item of cartItems) {
        await variantService.decrementStock(item.variantId._id, item.quantity)
    }

    if (discount) {
        await discountService.incrementUsage(discount._id)
    }

    if (pointsToRedeem) {
        await loyaltyService.redeemPoints(userId, pointsToRedeem)
    }
    await loyaltyService.earnPoints(userId, amountAfterPoints)

    await CartItem.deleteMany({ cartId: cart._id })

    return order
}

async function updateOrderStatus(orderId, status) {
    const order = await Order.findByIdAndUpdate(
        orderId,
        { orderStatus: status },
        { new: true, runValidators: true },
    )
    if (!order) {
        throw new Error('Order not found.')
    }
    return order
}

async function getUserOrders(userId) {
    return Order.find({ userId: userId }).sort({ createdAt: -1 })
}

async function getOrderById(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, userId: userId })
    if (!order) {
        throw new Error('Order not found.')
    }
    return order
}

async function cancelOrder(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, userId: userId })
    if (!order) {
        throw new Error('Order not found.')
    }
    if (order.orderStatus === 'cancelled') {
        throw new Error('Order is already cancelled.')
    }
    if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
        throw new Error('Order can no longer be cancelled.')
    }

    order.orderStatus = 'cancelled'
    return order.save()
}

module.exports = {
    calculateSubtotal,
    checkout,
    updateOrderStatus,
    getUserOrders,
    getOrderById,
    cancelOrder,
}
