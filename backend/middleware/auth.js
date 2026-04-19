const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "bonde_smartschool_secret_2026";

module.exports = {
  SECRET,
  authMiddleware: (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    try {
      req.user = jwt.verify(header.slice(7), SECRET);
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  },
  adminOnly: (req, res, next) => {
    if (req.user?.role !== "admin" && req.user?.role !== "teacher") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  }
};
