const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const UserSchema = new Schema(
  {
    email: {
      type: String,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please use a valid email address"],
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Name is required for creating a account"],
    },
    password: {
      type: String,
      required: [true, "Password must be required for creating a account"],
      minlength: [6, "password contain more than 6 characters"],
      select: false,
    },
    systemUser: {
      type: Boolean,
      default: false,
      immutable: true,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
  return;
});

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};
const user = mongoose.model("user", UserSchema);
module.exports = user;
