const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      // Should ideally be caught by protect middleware first
      return res
        .status(401)
        .json({ message: "Not authorized, user not available" });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message: `User role '${req.user.role}' is not authorized to access this route`,
        });
    }
    next();
  };
};

module.exports = authorize;
