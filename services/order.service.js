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
    const { userId, addressId, paymentMethod, discountCode } = data
    let { pointsToRedeem, deliveryFee } = data

    if (!pointsToRedeem) {
        pointsToRedeem = 0
    }
    if (!deliveryFee) {
        deliveryFee = 0
    }

    const cart = await Cart.findOne({ userId })
    if (!cart) {
        console.log('Cart not found')
        return null
    }

    const cartItems = await CartItem.find({ cartId: cart._id }).populate('variantId')
    if (cartItems.length === 0) {
        console.log('Cart is empty')
        return null
    }

    for (const item of cartItems) {
        const inStock = await variantService.isInStock(item.variantId._id, item.quantity)
        if (!inStock) {
            console.log('Insufficient stock for variant ' + item.variantId._id)
            return null
        }
    }

    const subTotal = calculateSubtotal(cartItems)

    let discount = null
    let discountAmount = 0
    if (discountCode) {
        discount = await discountService.validateDiscount(discountCode, userId)
        if (!discount) {
            return null
        }
        discountAmount = subTotal * (discount.discountValue / 100)
    }

    let amountAfterDiscount = subTotal - discountAmount
    if (amountAfterDiscount < 0) {
        amountAfterDiscount = 0
    }

    const pointsDeduction = await loyaltyService.calculateRedemptionValue(pointsToRedeem, userId)
    if (pointsDeduction === null) {
        return null
    }

    let amountAfterPoints = amountAfterDiscount - pointsDeduction
    if (amountAfterPoints < 0) {
        amountAfterPoints = 0
    }

    const totalAmount = amountAfterPoints + deliveryFee

    const order = await Order.create({
        userId,
        addressId,
        orderStatus: 'pending',
        paymentMethod,
        subTotal,
        discountId: discount ? discount._id : undefined,
        discountAmount,
        deliveryFee,
        totalAmount
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
        { new: true, runValidators: true }
    )
    if (!order) {
        console.log('Order not found')
        return null
    }
    return order
}

async function getUserOrders(userId) {
    return Order.find({ userId }).sort({ createdAt: -1 })
}

async function getAllOrders() {
    return Order.find().sort({ createdAt: -1 })
}

async function getOrderById(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, userId })
    if (!order) {
        console.log('Order not found')
        return null
    }
    return order
}

async function cancelOrder(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, userId })
    if (!order) {
        console.log('Order not found')
        return null
    }
    if (order.orderStatus === 'cancelled') {
        console.log('Order is already cancelled')
        return null
    }
    if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
        console.log('Order can no longer be cancelled')
        return null
    }

    order.orderStatus = 'cancelled'
    return order.save()
}

module.exports = {
    calculateSubtotal,
    checkout,
    updateOrderStatus,
    getUserOrders,
    getAllOrders,
    getOrderById,
    cancelOrder
}
