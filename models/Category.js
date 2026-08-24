const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
        type: String,
        unique: true,
        required: true
    },
    parentCategory:{
      type: mongoose.Schema.Types.ObjectId,
      default:null,
      ref: 'Category'
    }
  },
  { timestamps: true },
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
