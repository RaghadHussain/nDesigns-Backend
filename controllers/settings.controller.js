const settingsService = require('../services/settings.service')

async function getSettings(req, res) {
    try {
        const settings = await settingsService.getSettings()
        res.status(200).json(settings)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function createSettings(req, res) {
    try {
        const { deliveryFee, pointsPerBHD } = req.body
        const settings = await settingsService.createSettings(deliveryFee, pointsPerBHD)
        res.status(201).json(settings)
    } catch (err) {
        console.log(err)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    getSettings,
    createSettings
}
