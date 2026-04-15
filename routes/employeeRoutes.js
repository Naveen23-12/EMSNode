const express = require("express");
const router = express.Router();
const controller = require("../controllers/employeeController");
const checkAuth = require("../middleware/authMiddleware");

// AGGREGATION ROUTES
router.get("/summary/department", checkAuth, controller.getDepartmentSummary);
router.get("/summary/highest-salary", checkAuth, controller.getHighestSalaryByDepartment);
router.get("/aggregate/list", checkAuth, controller.getEmployeesWithAggregation);

router.get("/", checkAuth, controller.getEmployees);
router.post("/", checkAuth, controller.addEmployee);
router.get("/:id", checkAuth, controller.getEmployeeById);
router.put("/:id", checkAuth, controller.updateEmployee);
router.delete("/:id", checkAuth, controller.deleteEmployee);

module.exports = router;