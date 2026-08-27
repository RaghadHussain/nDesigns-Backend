const Discount = require('../models/Discount')
const Order = require('../models/Order')

async function validateDiscount(code, userId) {
    const discount = await Discount.findOne({ code: code.toUpperCase().trim() })
    if (!discount) {
        console.log('Discount code not found')
        return null
    }

    const now = new Date()
    if (now < discount.startDate || now > discount.endDate) {
        console.log('Discount code is not active')
        return null
    }

    if (discount.usedCount >= discount.usageLimit) {
        console.log('Discount code usage limit has been reached')
        return null
    }

    const alreadyUsed = await Order.findOne({ userId, discountId: discount._id })
    if (alreadyUsed) {
        console.log('Discount code has already been used by this user')
        return null
    }

    return discount
}

async function incrementUsage(discountId) {
    return Discount.findByIdAndUpdate(discountId, { $inc: { usedCount: 1 } })
}

async function getAllDiscounts() {
    return Discount.find().sort({ createdAt: -1 })
}

module.exports = {
    validateDiscount,
    incrementUsage,
    getAllDiscounts
}
