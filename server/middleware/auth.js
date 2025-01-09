const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  authorizeRoles:
    (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    },

    authenticate: (req, res, next) => {
      const token = req.header("Authorization")?.split(" ")[1];
      // console.log("Token::: ", token);
      
      if (!token) return res.status(401).json({ message: "Access Denied" });
      // console.log("1");

      try {
        // console.log("ads ",verified);
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        res.user = verified;
        next();
      } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
      }
      next();
    },
};
