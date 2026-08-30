const DeliverySettings = require('../models/DeliverySettings')

async function getDeliveryFee() {
    const settings = await DeliverySettings.findOne().sort({ createdAt: -1 })
    if (!settings) {
        const defaultSettings = await DeliverySettings.create({})
        return defaultSettings.fee
    }
    return settings.fee
}

async function createDeliveryFee(fee) {
    const settings = await DeliverySettings.create({ fee })
    return settings.fee
}

module.exports = {
    getDeliveryFee,
    createDeliveryFee
}
