const User = require("../models/User");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });

  if (user) {
    req.session.username = username;
    return res.json({ status: "success" });
  }

  res.json({ status: "error", message: "Invalid credentials" });
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.json({ status: "logged_out" });
};