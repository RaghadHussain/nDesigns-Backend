const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    images: {
        type: [String]
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
