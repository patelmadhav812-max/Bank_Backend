const express = require("express");
const router = express.Router();
const {
  CreateTransaction,
  createInitialFundsTransaction: SystemInitialFunds,
} = require("../Controller/transaction.controller");
const isSystemuser = require("..//middleware/isSystemUser.middleware");
const { isLogined } = require("../middleware/isLogined.middleware");

// create new transaction
// post - /api/transcations/
router.post("/", isLogined, CreateTransaction);

//create initial funds transcation for system user\
// post - /api/transcations/System/initial-funds
router.post("/System/initial-funds", isSystemuser, SystemInitialFunds);

module.exports = router;
