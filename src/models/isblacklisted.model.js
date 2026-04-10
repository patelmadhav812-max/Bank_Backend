const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const isBlackListedTokenSchema = new Schema(
  {
    token: {
      type: String,
      required: [true, "token is required to blacklist a token"],
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

isBlackListedTokenSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 3 },
);
module.exports = mongoose.model("isBlackListedToken", isBlackListedTokenSchema);
