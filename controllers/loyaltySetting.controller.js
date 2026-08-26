const LoyaltySettings = require('../models/LoyaltySettings')


async function addLoyaltySetting(req, res) {
    try {
        const { pointsPerBHD } = req.body
        const newLoyalitySetting = await LoyaltySettings.create(pointsPerBHD)

        res.status(201).json(newLoyalitySetting)
    } catch (e) {
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getLoyaltySetting(req, res) {
    try {
        const currentLoyaltySetting = await LoyaltySettings.findById(req.params.id)

        res.status(200).json(currentLoyaltySetting)
    } catch (e) {
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function updateLoyalitySetting(req, res) {
    try {
        const { pointsPerBHD } = req.body
        const updateData = pointsPerBHD

        const updatedLoyaltyPoints = await LoyaltySettings.findByIdAndUpdate(req.params.id)
    } catch (e) {
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    addLoyaltySetting,
    getLoyaltySetting,
    updateLoyalitySetting
}