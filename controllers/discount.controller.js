const Discount = require('../models/Discount')
const discountService = require('../services/discount.service')

async function createDiscount(req, res) {
    try {
        const { code, discountValue, usageLimit, startDate, endDate } = req.body

        if (!code || discountValue === undefined || !usageLimit || !startDate || !endDate) {
            return res.status(400).json({ message: 'Code, discountValue, usageLimit, startDate, and endDate are required.' })
        }

        const discount = await Discount.create({ code, discountValue, usageLimit, startDate, endDate })

        res.status(201).json(discount)
    } catch (err) {
        console.log(err)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Discount code already exists.' })
        }
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getAllDiscounts(req, res) {
    try {
        const discounts = await discountService.getAllDiscounts()
        res.status(200).json(discounts)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function applyDiscount(req, res) {
    try {
        const { code } = req.body
        if (!code) {
            return res.status(400).json({ message: 'Discount code is required.' })
        }

        const discount = await discountService.validateDiscount(code, req.user._id)

        if (!discount) {
            return res.status(400).json({ message: 'Discount code is invalid or cannot be used.' })
        }

        res.status(200).json({ code: discount.code, discountValue: discount.discountValue })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    createDiscount,
    getAllDiscounts,
    applyDiscount
}
