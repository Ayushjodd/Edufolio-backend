const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");

function adminMiddleware(req, res, next) {
  const adminToken = req.headers.authorization;

  if (!adminToken) {
    return res.status(403).json({
      message: "No token provided, you are not signed in",
    });
  }

  try {
    const decoded = jwt.verify(adminToken.split(" ")[1], JWT_ADMIN_PASSWORD);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Failed to authenticate token",
    });
  }
}

module.exports = { adminMiddleware };
