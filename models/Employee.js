const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  department: String,
  salary: Number
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);