const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        city: {
            type: String,
            required: true
        },
        block: {
            type: Number,
            required: true
        },
        road: {
            type: Number,
            required: true
        },
        building: {
            type: Number,
            required: true
        },
        apartment: {
            type: Number
        },
        note: {
            type: String
        }
    },
    { timestamps: true },
);


const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
