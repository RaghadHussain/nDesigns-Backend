const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
    {
        cartId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cart',
            required: true
        },
        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductVariant',
            required: true
        },
        quantity: {
            type: Number,
            min: 1,
            required: true
        }
    },
    { timestamps: true },
);

cartItemSchema.index({ cartId: 1, variantId: 1 }, { unique: true });

const CartItem = mongoose.model("CartItem", cartItemSchema);

module.exports = CartItem;
