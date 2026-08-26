const LoyaltySettings = require('../models/LoyaltySettings')


async function addLoyaltySetting(req, res) {
    try {
        const { pointsPerBHD } = req.body
        const newLoyalitySetting = await LoyaltySettings.create({ pointsPerBHD })

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

        const updatedLoyaltyPoints = await LoyaltySettings.findByIdAndUpdate(
            req.params.id,
            { pointsPerBHD },
            { new: true, runValidators: true }
        )

        if (!updatedLoyaltyPoints) {
            return res.status(404).json({ message: 'Loyalty setting not found.' })
        }

        res.status(200).json(updatedLoyaltyPoints)
    } catch (e) {
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    addLoyaltySetting,
    getLoyaltySetting,
    updateLoyalitySetting
}