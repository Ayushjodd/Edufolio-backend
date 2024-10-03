const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config");

function userMiddleware(req, res, next) {
  const Token = req.headers.authorization;

  if (!Token) {
    return res.status(403).json({
      message: "No token provided, you are not signed in",
    });
  }

  try {
    const decoded = jwt.verify(Token.split(" ")[1], JWT_USER_PASSWORD);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Failed to authenticate token",
    });
  }
}
module.exports = {
  userMiddleware: userMiddleware,
};
