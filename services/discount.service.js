const Discount = require('../models/Discount')
const Order = require('../models/Order')

async function validateDiscount(code, userId) {
    const discount = await Discount.findOne({ code: code.toUpperCase().trim() })
    if (!discount) {
        throw new Error('Discount code not found.')
    }

    const now = new Date()
    if (now < discount.startDate || now > discount.endDate) {
        throw new Error('Discount code is not active.')
    }

    if (discount.usedCount >= discount.usageLimit) {
        throw new Error('Discount code usage limit has been reached.')
    }

    const alreadyUsed = await Order.findOne({ userId: userId, discountId: discount._id })
    if (alreadyUsed) {
        throw new Error('Discount code has already been used by this user.')
    }

    return discount
}

async function incrementUsage(discountId) {
    return Discount.findByIdAndUpdate(discountId, { $inc: { usedCount: 1 } })
}

module.exports = {
    validateDiscount,
    incrementUsage,
}
