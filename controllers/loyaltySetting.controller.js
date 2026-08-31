const LoyaltySettings = require('../models/LoyaltySettings')
const loyaltyService = require('../services/loyalty.service')

async function getLoyaltySetting(req, res) {
    try {
        const pointsPerBHD = await loyaltyService.getPointsPerBHD()
        res.status(200).json({ pointsPerBHD })
    } catch (e) {
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function addLoyaltySetting(req, res) {
    try {
        const { pointsPerBHD } = req.body
        const newLoyaltySetting = await LoyaltySettings.create({ pointsPerBHD })

        res.status(201).json({ pointsPerBHD: newLoyaltySetting.pointsPerBHD })
    } catch (e) {
        if (e.name === 'ValidationError') {
            return res.status(400).json({ message: e.message })
        }
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    getLoyaltySetting,
    addLoyaltySetting
}
