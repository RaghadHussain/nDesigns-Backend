const mongoose = require("mongoose");

const deliverySettingsSchema = new mongoose.Schema(
  {
    fee: {
      type: Number,
      required: true,
      min: 0,
      default: 2,
    },
  },
  { timestamps: true },
);

const DeliverySettings = mongoose.model("DeliverySettings", deliverySettingsSchema);

module.exports = DeliverySettings;
