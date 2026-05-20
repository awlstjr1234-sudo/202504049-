const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const socialSchema = new mongoose.Schema(
  {
    id: { type: String },
    linkedAt: { type: Date }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    name: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      trim: true
    },
    loginType: {
      type: String,
      enum: ["password", "kakao", "naver", "google"],
      default: "password"
    },
    social: {
      kakao: socialSchema,
      naver: socialSchema,
      google: socialSchema
    },
    lastLogin: {
      type: Date,
      default: Date.now
    },
    settings: {
      monthlyBudget: {
        type: Number,
        default: 50000
      },
      preferredCategories: {
        type: [String],
        default: []
      },
      preferredDietary: {
        type: [String],
        default: []
      }
    },
    ingredients: {
      type: [
        {
          name: String,
          addedAt: Date
        }
      ],
      default: []
    },
    shopping: {
      type: [
        {
          name: String,
          addedAt: Date
        }
      ],
      default: []
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
