const deliverySettingsService = require('../services/deliverySettings.service')

async function getDeliveryFee(req, res) {
    try {
        const fee = await deliverySettingsService.getDeliveryFee()
        res.status(200).json({ fee })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function createDeliveryFee(req, res) {
    try {
        const { fee } = req.body
        const savedFee = await deliverySettingsService.createDeliveryFee(fee)
        res.status(201).json({ fee: savedFee })
    } catch (err) {
        console.log(err)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    getDeliveryFee,
    createDeliveryFee
}
