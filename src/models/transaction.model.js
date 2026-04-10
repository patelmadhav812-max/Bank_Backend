const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: [true, "transaction must be associated with a from account"],
      index: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: [true, "transaction must be associated with a to account"],
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["SUCCESSFULL", "FAILED", "REVERSED", "PENDING"],
        message: "status can only be SUCCESSFULL,FAILED,REVERSED,PENDING",
      },
      default: "PENDING",
    },
    idempotencyKey: {
      type: String,
      required: [true, "idempotency key is required"],
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const Transaction = mongoose.model("transaction", transactionSchema);
module.exports = Transaction;
