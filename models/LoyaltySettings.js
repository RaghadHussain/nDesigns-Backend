const mongoose = require("mongoose");

const loyaltySettingsSchema = new mongoose.Schema(
  {
    pointsPerBHD: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

const LoyaltySettings = mongoose.model("LoyaltySettings", loyaltySettingsSchema);

module.exports = LoyaltySettings;
