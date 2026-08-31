const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },
    pointsPerBHD: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

const Settings = mongoose.model("Settings", settingsSchema);

module.exports = Settings;
