const orderService = require('../services/order.service')
const orderItemService = require('../services/orderItem.service')

async function checkout(req, res) {
    try {
        const addressId = req.body.addressId
        const paymentMethod = req.body.paymentMethod
        const discountCode = req.body.discountCode
        const pointsToRedeem = req.body.pointsToRedeem
        const deliveryFee = req.body.deliveryFee

        if (!addressId || !paymentMethod) {
            return res.status(400).json({ message: 'Address and payment method are required.' })
        }

        const order = await orderService.checkout({
            userId: req.user._id,
            addressId: addressId,
            paymentMethod: paymentMethod,
            discountCode: discountCode,
            pointsToRedeem: pointsToRedeem,
            deliveryFee: deliveryFee,
        })

        res.status(201).json(order)
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err.message })
    }
}

async function updateOrderStatus(req, res) {
    try {
        const status = req.body.status
        const order = await orderService.updateOrderStatus(req.params.id, status)
        res.status(200).json(order)
    } catch (err) {
        console.log(err)
        if (err.message === 'Order not found.') {
            return res.status(404).json({ message: err.message })
        }
        res.status(400).json({ message: err.message })
    }
}

async function getUserOrders(req, res) {
    try {
        const orders = await orderService.getUserOrders(req.user._id)
        res.status(200).json(orders)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getOrderById(req, res) {
    try {
        const order = await orderService.getOrderById(req.params.id, req.user._id)
        const items = await orderItemService.getOrderItems(order._id)
        res.status(200).json({ order: order, items: items })
    } catch (err) {
        console.log(err)
        if (err.message === 'Order not found.') {
            return res.status(404).json({ message: err.message })
        }
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function cancelOrder(req, res) {
    try {
        const order = await orderService.cancelOrder(req.params.id, req.user._id)
        res.status(200).json(order)
    } catch (err) {
        console.log(err)
        if (err.message === 'Order not found.') {
            return res.status(404).json({ message: err.message })
        }
        res.status(400).json({ message: err.message })
    }
}

module.exports = {
    checkout,
    updateOrderStatus,
    getUserOrders,
    getOrderById,
    cancelOrder,
}
