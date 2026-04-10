const Transaction = require("../models/transaction.model");
const Account = require("../models/account.model");
const Ledger = require("../models/ledger.model");
const mongoose = require("mongoose");
const { sendMoneyTransferEmail } = require("../Services/email.services");
//*
// 1 - Validate Request *
// 2 - Check if the transaction is idempotent *
//3 - account status
// 4 - Driver sender balance from ledger
// 5-  Create the transaction
// 6 - create debit ledger entry
// 7 - create credit ledger entry
// 8 - mark transaction completed
// 9 - Commit mongodb session
// 10- send Email notification
//**

const CreateTransaction = async (req, res) => {
  //1- validate request
  let { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "All fields are required" });
  }
  // find users Account
  const fromUserAccount = await Account.findById(fromAccount);
  const toUserAccount = await Account.findById(toAccount);
  if (!fromUserAccount || !toUserAccount) {
    return res.status(404).json({ message: "Account not found" });
  }
  // 2-Check if the transaction is idempotent key
  const isIdempotencyKey = await Transaction.findOne({ idempotencyKey });
  if (isIdempotencyKey) {
    if (isIdempotencyKey.status === "SUCCESSFULL") {
      return res.status(200).json({
        message: "Transaction already completed",
        transaction: isIdempotencyKey,
      });
    }
    if (isIdempotencyKey.status === "FAILED") {
      return res.status(401).json({ message: "Transaction already failed" });
    }
    if (isIdempotencyKey.status === "REVERSED") {
      return res.status(500).json({ message: "Transaction already reversed" });
    }
    if (isIdempotencyKey.status === "PENDING") {
      return res
        .status(500)
        .json({ message: "Transaction already in progress" });
    }
  }
  // 3- Account Status
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({ message: "Account is not active" });
  }
  // 4- Driver sender balance from ledger
  const Balance = await fromUserAccount.getBalance();
  if (Balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance in fromaccount .Current balance is ${Balance} . Requested amount is ${amount}`,
    });
  }
  let transaction;
  let session;
  try {
    // 5- create a transaction
    session = await mongoose.startSession();
    session.startTransaction();
    transaction = await Transaction.create(
      [
        {
          fromAccount: fromUserAccount,
          toAccount: toUserAccount,
          idempotencyKey: idempotencyKey,
          amount: amount,
          status: "PENDING",
        },
      ],
      { session },
    );
    transaction = transaction[0];
    // 6- create debit ledger entry
    const DebitLedger = await Ledger.create(
      [
        {
          account: fromUserAccount,
          amount: amount,
          type: "DEBIT",
          transaction: transaction._id,
        },
      ],
      { session },
    );
    await (() => {
      return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    })();
    const CreditLedger = await Ledger.create(
      [
        {
          account: toUserAccount,
          amount: amount,
          type: "CREDIT",
          transaction: transaction._id,
        },
      ],
      { session },
    );
    await Transaction.findByIdAndUpdate(
      transaction._id,
      { status: "SUCCESSFULL" },
      { returnDocument: "after", session },
    );
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (transaction?._id) {
      await Transaction.findByIdAndUpdate(transaction._id, {
        status: "FAILED",
      });
    }
    return res.status(400).json({
      message: "Transaction pending",
    });
  }

  //10- send Email
  await sendMoneyTransferEmail(
    req.user.email,
    req.user.name,
    amount,
    toUserAccount.name,
  );
  return res.status(200).json({
    message: "Transaction completed successfully",
    transaction_id: transaction._id,
  });
};

// * This function is used to create a transaction for adding initial funds to a user's account by the system user. *
async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idempotencyKey are required",
    });
  }

  const toUserAccount = await Account.findOne({
    _id: toAccount,
  });

  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid toAccount",
    });
  }

  const fromUserAccount = await Account.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
    return res.status(400).json({
      message: "System user account not found",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  // Create the transaction
  const transaction = await Transaction.create(
    {
      fromAccount: fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey: idempotencyKey,
      status: "PENDING",
    },
    { session },
  );
  await transaction.save({ session });

  //Ledger entries for initial funds transaction
  const debitLedgerEntry = await Ledger.create(
    [
      {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );

  const creditLedgerEntry = await Ledger.create(
    [
      {
        account: toUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );

  // transaction.status = "SUCCESSFULL";
  // await transaction.save({ session });
  await Transaction.findByIdAndUpdate(
    transaction._id,
    { status: "SUCCESSFULL" },
    { session },
  );
  await session.commitTransaction();
  session.endSession();

  return res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction: transaction,
  });
}
module.exports = { CreateTransaction, createInitialFundsTransaction };
