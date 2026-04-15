const Employee = require("../models/Employee");
const sendMail = require("../utils/sendMail");

// GET ALL EMPLOYEES
exports.getEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const keyword = req.query.keyword || "";

    const limit = 5;
    const skip = (page - 1) * limit;

    const query = keyword
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

    return res.json({
      employees,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.log("GET EMPLOYEES ERROR:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
};

// ADD EMPLOYEE + SEND MAIL
exports.addEmployee = async (req, res) => {
  try {
    const { name, email, department, salary } = req.body;

    if (!name || !email || !department || !salary) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required"
      });
    }

    const existing = await Employee.findOne({ email: email.trim() });

    if (existing) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists"
      });
    }

    const newEmp = await Employee.create({
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      salary
    });

    await sendMail(
      email.trim(),
      "EMS Registration Successful",
      `
        <div style="font-family: Arial, sans-serif;">
          <h2>Welcome to EMS</h2>
          <p>You are successfully added to EMS.</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Department:</strong> ${department}</p>
        </div>
      `
    );

    return res.json({
      status: "success",
      message: "Employee added and email sent",
      employee: newEmp
    });
  } catch (err) {
    console.log("ADD EMPLOYEE ERROR:", err);

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

// GET EMPLOYEE BY ID
exports.getEmployeeById = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);

    if (!emp) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.json(emp);
  } catch (err) {
    console.log("GET EMPLOYEE BY ID ERROR:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
};

// UPDATE EMPLOYEE
exports.updateEmployee = async (req, res) => {
  try {
    const { name, email, department, salary } = req.body;

    const existing = await Employee.findOne({
      email: email.trim(),
      _id: { $ne: req.params.id }
    });

    if (existing) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists"
      });
    }

    await Employee.findByIdAndUpdate(req.params.id, {
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      salary
    });

    return res.json({ status: "updated" });
  } catch (err) {
    console.log("UPDATE EMPLOYEE ERROR:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
};

// DELETE EMPLOYEE
exports.deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    return res.json({ status: "deleted" });
  } catch (err) {
    console.log("DELETE EMPLOYEE ERROR:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
};


// AGGREGATION 1: DEPARTMENT SUMMARY
exports.getDepartmentSummary = async (req, res) => {
  try {
    const result = await Employee.aggregate([
      {
        $group: {
          _id: "$department",
          totalEmployees: { $sum: 1 },
          totalSalary: { $sum: "$salary" },
          averageSalary: { $avg: "$salary" }
        }
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          totalEmployees: 1,
          totalSalary: 1,
          averageSalary: { $round: ["$averageSalary", 2] }
        }
      },
      {
        $sort: { totalEmployees: -1 }
      }
    ]);

    return res.status(200).json(result);
  } catch (err) {
    console.log("DEPARTMENT SUMMARY ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// AGGREGATION 2: HIGHEST SALARY BY DEPARTMENT
exports.getHighestSalaryByDepartment = async (req, res) => {
  try {
    const result = await Employee.aggregate([
      { $sort: { department: 1, salary: -1 } },
      {
        $group: {
          _id: "$department",
          highestPaidEmployee: { $first: "$name" },
          highestSalary: { $first: "$salary" }
        }
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          highestPaidEmployee: 1,
          highestSalary: 1
        }
      }
    ]);

    return res.status(200).json(result);
  } catch (err) {
    console.log("HIGHEST SALARY ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// AGGREGATION 3: EMPLOYEE LIST WITH AGGREGATION + PAGINATION
exports.getEmployeesWithAggregation = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const keyword = req.query.keyword || "";

    const matchStage = keyword
      ? {
          $match: { 
            $or: [
              { name: { $regex: keyword, $options: "i" } },
              { email: { $regex: keyword, $options: "i" } },
              { department: { $regex: keyword, $options: "i" } }
            ]
          }
        }
      : { $match: {} };

    const employees = await Employee.aggregate([
      matchStage,
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const totalCount = await Employee.aggregate([
      matchStage,
      { $count: "total" }
    ]);

    const total = totalCount.length > 0 ? totalCount[0].total : 0;

    return res.status(200).json({
      employees,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.log("EMPLOYEE AGG ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};