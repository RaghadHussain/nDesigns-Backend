const ProductVariant = require('../models/ProductVariant')
const Product = require('../models/Product')
const OrderItem = require('../models/OrderItem')
const CartItem = require('../models/CartItem')

async function createVariant(req, res) {
    const { size, price, quantity } = req.body
    try {
        if (!size || price === undefined || quantity === undefined) {
            return res.status(400).json({ message: 'Size, price, and quantity are required.' })
        }

        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' })
        }

        const createdVariant = await ProductVariant.create({
            size,
            price,
            quantity,
            productId: req.params.id,
        })

        return res.status(201).json(createdVariant)
    } catch (err) {
        console.log(err)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Variant with this size already exists for this product.' })
        }
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getVariantByProduct(req, res) {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' })
        }

        const foundVariant = await ProductVariant.find({ productId: req.params.id })
        return res.status(200).json(foundVariant)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function updateVariant(req, res) {
    try {
        const { size, price, quantity } = req.body

        const updatedVariant = await ProductVariant.findByIdAndUpdate(
            req.params.variantId,
            { size, price, quantity },
            { new: true, runValidators: true },
        )

        if (!updatedVariant) {
            return res.status(404).json({ message: 'Variant not found.' })
        }

        return res.status(200).json(updatedVariant)

    } catch (err) {
        console.log(err)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }

        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getVariantById(req, res) {
    try {
        const foundVariant = await ProductVariant.findById(req.params.variantId)
        if (!foundVariant) {
            return res.status(404).json({ message: 'Variant not found.' })
        }

        return res.status(200).json(foundVariant)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function deleteVariant(req, res) {
    try {
        const variant = await ProductVariant.findById(req.params.variantId)
        if (!variant) {
            return res.status(404).json({ message: 'Variant not found.' })
        }

        const orderedVariant = await OrderItem.findOne({ variantId: req.params.variantId })
        if (orderedVariant) {
            return res.status(409).json({ message: 'Cannot delete a variant that appears in existing orders.' })
        }

        await CartItem.deleteMany({ variantId: req.params.variantId })
        await ProductVariant.findByIdAndDelete(req.params.variantId)

        return res.status(200).json({ message: 'Variant deleted successfully.' })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    createVariant,
    getVariantByProduct,
    getVariantById,
    updateVariant,
    deleteVariant,
}