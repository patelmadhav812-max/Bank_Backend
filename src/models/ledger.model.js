const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ledgerSchema = new Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    immutable: true,
    required: [true, "account is required"],
  },
  amount: {
    type: Number,
    required: [true, "amount is required"],
    immutable: true,
    required: true,
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "transaction",
    required: [true, "transaction is required"],
    immutable: true,
  },
  type: {
    type: String,
    enum: {
      values: ["DEBIT", "CREDIT"],
      message: "type can only be DEBIT or CREDIT",
    },
    required: [true, "type is required"],
    immutable: true,
  },
});

// Prevent any updates or deletions to ledger entries after they are created
ledgerSchema.pre("save", function () {
  if (!this.isNew) {
    return new Error("Ledger entries cannot be modified");
  }
});

ledgerSchema.pre("updateOne", function () {
  throw new Error("Ledger entries cannot be modified");
});

ledgerSchema.pre("updateMany", function () {
  throw new Error("Ledger entries cannot be modified");
});

ledgerSchema.pre("findOneAndUpdate", function () {
  throw new Error("Ledger entries cannot be modified");
});

ledgerSchema.pre("findOneAndReplace", function () {
  throw new Error("Ledger entries cannot be modified");
});

ledgerSchema.pre("deleteOne", function () {
  throw new Error("Ledger entries cannot be modified");
});

ledgerSchema.pre("deleteMany", function () {
  throw new Error("Ledger entries cannot be modified");
});
const Ledger = mongoose.model("ledger", ledgerSchema);
module.exports = Ledger;
