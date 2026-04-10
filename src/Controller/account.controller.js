const accountModel = require("../models/account.model");

const newAccount = async (req, res) => {
  const user = req.user;
  const newAcc = await accountModel.create({
    user: user._id,
  });
  res.status(201).json({
    newAcc,
  });
};

// Get all accounts
const getAllAccounts = async (req, res) => {
  const user = req.user;
  const accounts = await accountModel.find({
    user: user._id,
  });
  res.status(200).json({
    accounts,
  });
};

//get account balance
const getAccountBalance = async (req, res) => {
  const { accountId } = req.params;

  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id,
  });

  if (!account) {
    return res.status(404).json({
      message: "Account not found",
    });
  }

  const balance = await account.getBalance();

  res.status(200).json({
    accountId: account._id,
    balance: balance,
  });
};
module.exports = {
  newAccount,
  getAllAccounts,
  getAccountBalance,
};
