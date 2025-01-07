const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = express.Router();
require("dotenv").config();


function createToken(obj) {
  return jwt.sign(obj, process.env.JWT_SECRET, { expiresIn: "1h" }); 
}

router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  // console.log(req.body);
  try {
    const user = new User({ username, password, role });
    console.log(user);
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = createToken({ id: user.id, role: user.role, username: user.username });
    req.cookies = { jwt: token };
    res.json({ token: token, user: req.body });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.json({ message: "Logout successful" });
});

module.exports = router;
