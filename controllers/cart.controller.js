const Cart = require('../models/Cart')
const CartItem = require('../models/CartItem')

async function getMyCart(req, res) {
    try {
        let cart = await Cart.findOne({ userId: req.user._id })
        if (!cart) {
            cart = await Cart.create({ userId: req.user._id })
        }

        const items = await CartItem.find({ cartId: cart._id }).populate('variantId')

        return res.status(200).json({ cart, items })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function clearMyCart(req, res) {
    try {
        const cart = await Cart.findOne({ userId: req.user._id })
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' })
        }

        await CartItem.deleteMany({ cartId: cart._id })

        return res.status(200).json({ message: 'Cart cleared successfully.' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    getMyCart,
    clearMyCart
}
