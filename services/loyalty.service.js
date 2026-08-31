const User = require('../models/User')
const settingsService = require('./settings.service')

async function getPointsPerBHD() {
    const { pointsPerBHD } = await settingsService.getSettings()
    return pointsPerBHD
}

function calculatePointsEarned(amount, pointsPerBHD) {
    if (!pointsPerBHD) {
        return 0
    }
    return Math.floor(amount / pointsPerBHD)
}

async function calculateRedemptionValue(pointsToRedeem, userId) {
    if (!pointsToRedeem) {
        return 0
    }

    const user = await User.findById(userId)
    if (!user) {
        console.log('User not found')
        return null
    }
    if (pointsToRedeem > user.loyaltyPoints) {
        console.log('Insufficient loyalty points')
        return null
    }

    const pointsPerBHD = await getPointsPerBHD()
    if (!pointsPerBHD) {
        console.log('Loyalty settings are not configured')
        return null
    }

    return pointsToRedeem / pointsPerBHD
}

async function redeemPoints(userId, pointsToRedeem) {
    if (!pointsToRedeem) {
        return
    }
    return User.findByIdAndUpdate(userId, { $inc: { loyaltyPoints: -pointsToRedeem } })
}

async function refundPoints(userId, points) {
    if (!points) {
        return
    }
    return User.findByIdAndUpdate(userId, { $inc: { loyaltyPoints: points } })
}

async function earnPoints(userId, amount) {
    const pointsPerBHD = await getPointsPerBHD()
    const pointsEarned = calculatePointsEarned(amount, pointsPerBHD)
    if (!pointsEarned) {
        return
    }
    return User.findByIdAndUpdate(userId, { $inc: { loyaltyPoints: pointsEarned } })
}

module.exports = {
    getPointsPerBHD,
    calculatePointsEarned,
    calculateRedemptionValue,
    redeemPoints,
    refundPoints,
    earnPoints
}
