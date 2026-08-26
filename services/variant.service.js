const ProductVariant = require('../models/ProductVariant')

async function isInStock(variantId, quantity) {
    const variant = await ProductVariant.findById(variantId)
    if (!variant) {
        console.log('Variant Not Found')
        return false
    }
    return variant.quantity >= quantity
}

async function decrementStock(variantId, quantity) {
    const variant = await ProductVariant.findById(variantId)
    if (!variant) {
        return console.log('Variant Not Found')
    }

    if (variant.quantity < quantity) {
        return console.log('Insuffecient stock')

    }

    variant.quantity = variant.quantity - quantity
    return variant.save()
}

module.exports = {
    isInStock,
    decrementStock,
}
