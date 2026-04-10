const Employee = require("../models/Employee");

exports.getEmployees = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.keyword || "";

  const limit = 5;
  const skip = (page - 1) * limit;

  let query = keyword
    ? {
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
          { department: { $regex: keyword, $options: "i" } }
        ]
      }
    : {};

  const employees = await Employee.find(query)
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Employee.countDocuments(query);

  res.json({
    employees,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  });
};

exports.addEmployee = async (req, res) => {
  try {
    await Employee.create(req.body);
    res.json({ status: "success" });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: "Email already exists"
    });
  }
};

exports.getEmployeeById = async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) return res.status(404).json({ message: "Not found" });

  res.json(emp);
};

exports.updateEmployee = async (req, res) => {
  await Employee.findByIdAndUpdate(req.params.id, req.body);
  res.json({ status: "updated" });
};

exports.deleteEmployee = async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ status: "deleted" });
};