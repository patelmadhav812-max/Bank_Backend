const UserModel = require("../models/user.model");
const isBlackListedTokenModel = require("../models/isblacklisted.model");
const jwt = require("jsonwebtoken");

const isLogined = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "token are missing from the cookies",
    });
  }

  try {
    const isBlackedListed = await isBlackListedTokenModel.findOne({ token });
    if (isBlackedListed) {
      return res.status(401).json({
        message: "Unauthorized access, token is blacklisted",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    const user = await UserModel.findById(decoded.userId);
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }
};

module.exports = {
  isLogined,
};
