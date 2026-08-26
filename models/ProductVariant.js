const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema(
  {
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    size: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    }
  },
  { timestamps: true },
);

productVariantSchema.index({ productId: 1, size: 1 }, { unique: true });

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);

module.exports = ProductVariant;
