const express = require("express");
const { isLogined } = require("..//middleware/isLogined.middleware");
const accountController = require("..//Controller/account.controller");
const router = express.Router();

//Cretae new account
// post - /api/accounts/
router.post("/", isLogined, accountController.newAccount);

//Get all accounts
//  get - /api/accounts/
router.get("/", isLogined, accountController.getAllAccounts);

//get account balance
// get - /api/account/balance/accountId
router.get(
  "/balance/:accountId",
  isLogined,
  accountController.getAccountBalance,
);
module.exports = router;
