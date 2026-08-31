const Settings = require('../models/Settings')

async function getSettings() {
    let settings = await Settings.findOne().sort({ createdAt: -1 })
    if (!settings) {
        settings = await Settings.create({ deliveryFee: 0, pointsPerBHD: 0 })
    }
    return {
        deliveryFee: settings.deliveryFee,
        pointsPerBHD: settings.pointsPerBHD,
    }
}

async function createSettings(deliveryFee, pointsPerBHD) {
    const settings = await Settings.create({ deliveryFee, pointsPerBHD })
    return {
        deliveryFee: settings.deliveryFee,
        pointsPerBHD: settings.pointsPerBHD,
    }
}

module.exports = {
    getSettings,
    createSettings
}
