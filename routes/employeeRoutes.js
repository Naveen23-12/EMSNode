const express = require("express");
const router = express.Router();
const controller = require("../controllers/employeeController");
const checkAuth = require("../middleware/authMiddleware");

router.get("/", checkAuth, controller.getEmployees);
router.post("/", checkAuth, controller.addEmployee);
router.get("/:id", checkAuth, controller.getEmployeeById);
router.put("/:id", checkAuth, controller.updateEmployee);
router.delete("/:id", checkAuth, controller.deleteEmployee);

module.exports = router;