const UserModel = require("../models/user.model");
const isBlackListedTokenModel = require("../models/isblacklisted.model");
const jwt = require("jsonwebtoken");
const { sendRegistrationEmail } = require("../Services/email.services");

// SignIn Controller
const SignInController = async (req, res) => {
  let { email, name, password } = req.body;
  let isExist = await UserModel.findOne({ email });
  if (isExist) {
    return res.status(422).json({ message: "This email is already exist" });
  }
  let user = await UserModel.create({ email, name, password });

  await sendRegistrationEmail(user.email, user.name); // ✅ here

  const token = jwt.sign({ userId: user._id }, process.env.JWT_TOKEN, {
    expiresIn: "3d",
  });
  res.cookie("token", token);
  return res.status(201).json({
    user: { _id: user._id, name: user.name, email: user.email },
    token,
  });
};

// Login Controller
const LoginController = async (req, res) => {
  let { email, password } = req.body;
  let user = await UserModel.findOne({ email }).select("+password");
  if (!user) {
    return res
      .status(401)
      .json({ message: "Failed to login user does not exist" });
  }
  let isValidatePass = await user.comparePassword(password);
  if (!isValidatePass) {
    return res.status(401).json({ message: "Password is incorrect" });
  }
  let token = jwt.sign({ userId: user._id }, process.env.JWT_TOKEN, {
    expiresIn: "3d",
  });
  res.cookie("token", token);
  return res.status(200).json({
    user: { _id: user._id, name: user.name, email: user.email },
    token,
  });
};

// Logout Controller
const LogoutController = async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split("")[1];
  if (!token) {
    res.status(400).json({
      message: "Token is missing from the cookies",
    });
  }
  try {
    const isBlackedListed = await isBlackListedTokenModel.findOne({ token });
    if (isBlackedListed) {
      return res.status(400).json({
        message: "Token is already blacklisted",
      });
    }
    await isBlackListedTokenModel.create({ token });
    res.clearCookie("token");
    res.status(200).json({
      message: "Logout Successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
module.exports = { SignInController, LogoutController, LoginController };
