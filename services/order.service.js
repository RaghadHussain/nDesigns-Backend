const Order = require('../models/Order')
const User = require('../models/User')
const OrderItem = require('../models/OrderItem')
const Cart = require('../models/Cart')
const CartItem = require('../models/CartItem')
const discountService = require('./discount.service')
const loyaltyService = require('./loyalty.service')
const orderItemService = require('./orderItem.service')
const variantService = require('./variant.service')
const deliverySettingsService = require('./deliverySettings.service')

function calculateSubtotal(cartItems) {
    let subTotal = 0
    for (const item of cartItems) {
        subTotal = subTotal + item.variantId.price * item.quantity
    }
    return subTotal
}

async function checkout(data) {
    const { userId, addressId, paymentMethod, discountCode } = data
    let { pointsToRedeem } = data
    const deliveryFee = await deliverySettingsService.getDeliveryFee()

    if (!pointsToRedeem) {
        pointsToRedeem = 0
    }

    if (pointsToRedeem < 0) {
        console.log('pointsToRedeem cannot be negative')
        return null
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
        totalAmount,
        pointsRedeemed: pointsToRedeem
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

    await CartItem.deleteMany({ cartId: cart._id })

    return order
}

async function updateOrderStatus(orderId, status) {
    const existingOrder = await Order.findById(orderId)
    if (!existingOrder) {
        console.log('Order not found')
        return null
    }
    const wasAlreadyDelivered = existingOrder.orderStatus === 'delivered'

    const order = await Order.findByIdAndUpdate(
        orderId,
        { orderStatus: status },
        { new: true, runValidators: true }
    )

    if (status === 'delivered' && !wasAlreadyDelivered) {
        const pointsBaseAmount = order.totalAmount - order.deliveryFee
        await loyaltyService.earnPoints(order.userId, pointsBaseAmount)
    }

    return order
}

async function getUserOrders(userId) {
    return Order.find({ userId }).sort({ createdAt: -1 })
}

async function getAllOrders() {
    return Order.find().sort({ createdAt: -1 })
}

async function getDashboardStats() {
    const [totalOrders, revenueAgg, pendingTailoring, activeCustomers] = await Promise.all([
        Order.countDocuments(),
        Order.aggregate([
            { $match: { orderStatus: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Order.countDocuments({ orderStatus: { $in: ['pending', 'confirmed'] } }),
        User.countDocuments({ role: 'customer' })
    ])

    return {
        totalOrders,
        netRevenue: revenueAgg[0]?.total || 0,
        pendingTailoring,
        activeCustomers
    }
}

async function getRecentOrders(limit = 20) {
    const orders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'username')

    const orderItems = await OrderItem.find({ orderId: { $in: orders.map(order => order._id) } })
        .populate({ path: 'variantId', populate: { path: 'productId', select: 'name' } })

    const itemsByOrderId = {}
    for (const item of orderItems) {
        const key = item.orderId.toString()
        if (!itemsByOrderId[key]) {
            itemsByOrderId[key] = []
        }
        itemsByOrderId[key].push(item)
    }

    return orders.map(order => {
        const items = itemsByOrderId[order._id.toString()] || []
        const firstItem = items[0]

        let orderedItem = '-'
        if (firstItem?.variantId?.productId) {
            orderedItem = `${firstItem.variantId.productId.name} (${firstItem.variantId.size})`
            if (items.length > 1) {
                orderedItem += ` +${items.length - 1} more`
            }
        }

        return {
            _id: order._id,
            client: order.userId?.username || 'Unknown',
            orderedDate: order.createdAt,
            orderedItem,
            totalCost: order.totalAmount,
            status: order.orderStatus
        }
    })
}

async function getOrderById(orderId, userId, isAdminUser) {
    const query = isAdminUser ? { _id: orderId } : { _id: orderId, userId }
    const order = await Order.findOne(query)
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
    await order.save()

    if (order.pointsRedeemed) {
        await loyaltyService.refundPoints(userId, order.pointsRedeemed)
    }

    return order
}

module.exports = {
    calculateSubtotal,
    checkout,
    updateOrderStatus,
    getUserOrders,
    getAllOrders,
    getDashboardStats,
    getRecentOrders,
    getOrderById,
    cancelOrder
}
