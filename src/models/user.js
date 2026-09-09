const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("invalid email address:" + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("pasword is not strong" + value);
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "{VALUE} is not a valid gender type",
      },
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
    },
    photoUrl: {
      type: String,
      default:
        "https://i.guim.co.uk/img/media/90f3d9d62e357b22062397771403e115ec6e0f53/804_287_2486_1988/master/2486.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=55620d64ae0f9ae6918a3b7528ebf841",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("invalid photo url:" + value);
        }
      },
    },
    about: {
      type: String,
      default: "this is a default about of the user!",
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.getJwt = async function () {
  const user = this;

  const token = await jwt.sign({ _id: user._id }, "bhes@123", {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash,
  );
  return isPasswordValid;
};
module.exports = mongoose.model("user", userSchema);
