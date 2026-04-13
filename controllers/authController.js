const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendMail = require("../utils/sendMail");

const SECRET = "mysecretkey";

// SIGNUP
exports.registerUser = async (req, res) => {
  try {
    const email = req.body.email.trim();
    const password = req.body.password.trim();

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword
    });

    await sendMail(
      email,
      "EMS Signup Successful",
      `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to EMS</h2>
          <p>You have successfully signed up to EMS.</p>
          <p><strong>Email:</strong> ${email}</p>
        </div>
      `
    );

    return res.status(201).json({
      status: "success",
      message: "Signup successful",
      user: {
        id: newUser._id,
        email: newUser.email
      }
    });
  } catch (err) {
    console.log("REGISTER ERROR:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists"
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
};

// LOGIN -> CHECK PASSWORD + SEND OTP
exports.login = async (req, res) => {
  try {
    const email = req.body.email.trim();
    const password = req.body.password.trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ status: "error", message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ status: "error", message: "Invalid credentials" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendMail(
      email,
      "Your EMS Login OTP",
      `
        <div style="font-family: Arial, sans-serif; padding: 20px; background:#f4f4f4;">
          <div style="max-width:500px;margin:auto;background:white;padding:20px;border-radius:10px;">
            <h2 style="text-align:center;color:#8b0000;">EMS Login Verification</h2>
            <p>Hello,</p>
            <p>Your One-Time Password (OTP) is:</p>
            <div style="text-align:center;margin:25px 0;">
              <span style="font-size:30px;letter-spacing:6px;font-weight:bold;color:#333;">
                ${otp}
              </span>
            </div>
            <p>This OTP is valid for <b>5 minutes</b>.</p>
            <p style="color:gray;font-size:12px;">Do not share this OTP with anyone.</p>
            <hr/>
            <p style="text-align:center;">EMS Team</p>
          </div>
        </div>
      `
    );

    return res.json({ status: "otp_sent" });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

// VERIFY OTP -> CREATE JWT
exports.verifyOTP = async (req, res) => {
  try {
    const email = req.body.email.trim();
    const otp = req.body.otp.trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ status: "error", message: "User not found" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.json({ status: "error", message: "OTP not generated" });
    }

    if (user.otp !== otp || user.otpExpiry.getTime() < Date.now()) {
      return res.json({ status: "error", message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      status: "success",
      token
    });
  } catch (err) {
    console.log("VERIFY OTP ERROR:", err);
    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

// LOGOUT
exports.logout = (req, res) => {
  return res.json({ status: "logged_out" });
};