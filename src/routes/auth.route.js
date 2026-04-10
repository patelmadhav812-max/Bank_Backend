const express = require("express");
const authController = require("../Controller/auth.controller");
const router = express.Router();

//register route
//post - /api/auth/register
router.post("/register", authController.SignInController);

//Login Route
// post - /api/auth/login
router.post("/login", authController.LoginController);

// logout route
// Api - /api/auth/logout
router.post("/logout", authController.LogoutController);
module.exports = router;
