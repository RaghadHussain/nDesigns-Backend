const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase:true
    },
    hashedPassword: {
      type: String,
      required: true
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      required: true
    },
    loyaltyPoints: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true },
);

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
