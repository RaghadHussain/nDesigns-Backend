const LoyaltySettings = require("../models/LoyaltySettings");
const User = require("../models/User");

async function getPointsPerBHD() {
  const settings = await LoyaltySettings.findOne();
  return settings ? settings.pointsPerBHD : 0;
}

function calculatePointsEarned(amount, pointsPerBHD) {
  return Math.floor(amount * pointsPerBHD);
}

async function calculateRedemptionValue(pointsToRedeem, userId) {
  if (!pointsToRedeem) return 0;

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }
  if (pointsToRedeem > user.loyaltyPoints) {
    throw new Error("Insufficient loyalty points.");
  }

  const pointsPerBHD = await getPointsPerBHD();
  if (!pointsPerBHD) {
    throw new Error("Loyalty settings are not configured.");
  }

  return pointsToRedeem / pointsPerBHD;
}

async function redeemPoints(userId, pointsToRedeem) {
  if (!pointsToRedeem) return;
  return User.findByIdAndUpdate(userId, { $inc: { loyaltyPoints: -pointsToRedeem } });
}

async function earnPoints(userId, amount) {
  const pointsPerBHD = await getPointsPerBHD();
  const pointsEarned = calculatePointsEarned(amount, pointsPerBHD);
  if (!pointsEarned) return;
  return User.findByIdAndUpdate(userId, { $inc: { loyaltyPoints: pointsEarned } });
}

module.exports = {
  getPointsPerBHD,
  calculatePointsEarned,
  calculateRedemptionValue,
  redeemPoints,
  earnPoints,
};
