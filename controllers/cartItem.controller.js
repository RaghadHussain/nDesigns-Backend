const Cart = require('../models/Cart')
const CartItem = require('../models/CartItem')
const ProductVariant = require('../models/ProductVariant')


async function addCartItem(req, res) {
    const { variantId, quantity } = req.body
    try {
        if (!variantId || quantity === undefined) {
            return res.status(400).json({ message: 'variantId and quantity are required.' })
        }

        const variant = await ProductVariant.findById(variantId)
        if (!variant) {
            return res.status(404).json({ message: 'Variant not found.' })
        }

        let cart = await Cart.findOne({ userId: req.user._id })
        if (!cart) {
            cart = await Cart.create({ userId: req.user._id })
        }

        let cartItem = await CartItem.findOne({ cartId: cart._id, variantId })
        if (cartItem) {
            cartItem.quantity += quantity
            await cartItem.save()
        } else {
            cartItem = await CartItem.create({ cartId: cart._id, variantId, quantity })
        }

        res.status(201).json(cartItem)
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }
        res.status(500).json({ message: 'Internal Server Error' })
    }
}


async function updateCartItem(req, res) {
    const { quantity } = req.body
    try {
        if (quantity === undefined || quantity < 1) {
            return res.status(400).json({ message: 'A valid quantity is required.' })
        }

        const cart = await Cart.findOne({ userId: req.user._id })
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' })
        }

        const cartItem = await CartItem.findOne({ _id: req.params.id, cartId: cart._id })
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found.' })
        }

        cartItem.quantity = quantity
        await cartItem.save()

        res.status(200).json(cartItem)
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function deleteCartItem(req, res) {
    try {
        const cart = await Cart.findOne({ userId: req.user._id })
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' })
        }

        const cartItem = await CartItem.findOneAndDelete({ _id: req.params.id, cartId: cart._id })
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found.' })
        }

        return res.status(200).json({ message: 'Cart item deleted successfully.' })
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    addCartItem,
    updateCartItem,
    deleteCartItem,
}