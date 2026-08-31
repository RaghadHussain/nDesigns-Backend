const orderService = require('../services/order.service')
const orderItemService = require('../services/orderItem.service')


async function checkout(req, res) {
    try {
        const { addressId, paymentMethod, discountCode, pointsToRedeem, deliveryFee } = req.body

        if (!addressId || !paymentMethod) {
            return res.status(400).json({ message: 'Address and payment method are required.' })
        }

        const order = await orderService.checkout({
            userId: req.user._id,
            addressId,
            paymentMethod,
            discountCode,
            pointsToRedeem,
            deliveryFee
        })

        if (!order) {
            return res.status(400).json({ message: 'Checkout failed. Please check your cart, discount code, and points.' })
        }

        try {
            await orderService.sendOrderConfirmation(order, req.user._id)
        } catch (e) {
            console.log('Failed to send order confirmation email:', e)
        }

        res.status(201).json(order)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function updateOrderStatus(req, res) {
    try {
        const { status } = req.body
        const order = await orderService.updateOrderStatus(req.params.id, status)

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' })
        }

        res.status(200).json(order)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
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

async function getAllOrders(req, res) {
    try {
        const orders = await orderService.getAllOrders()
        res.status(200).json(orders)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getDashboardStats(req, res) {
    try {
        const stats = await orderService.getDashboardStats()
        res.status(200).json(stats)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getRecentOrders(req, res) {
    try {
        const orders = await orderService.getRecentOrders(20)
        res.status(200).json(orders)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getOrderById(req, res) {
    try {
        const order = await orderService.getOrderById(req.params.id, req.user._id)

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' })
        }

        const items = await orderItemService.getOrderItems(order._id)
        res.status(200).json({ order, items })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function cancelOrder(req, res) {
    try {
        const order = await orderService.cancelOrder(req.params.id, req.user._id)

        if (!order) {
            return res.status(400).json({ message: 'Order cannot be cancelled.' })
        }

        res.status(200).json(order)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}



module.exports = {
    checkout,
    updateOrderStatus,
    getUserOrders,
    getAllOrders,
    getDashboardStats,
    getRecentOrders,
    getOrderById,
    cancelOrder
}
