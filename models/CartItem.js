const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
    {
        cartId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cart'
        },
        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductVariant'
        },
        quantity: {
            type: Number
        }
    },
    { timestamps: true },
);


const CartItem = mongoose.model("CartItem", cartItemSchema);

module.exports = CartItem;
