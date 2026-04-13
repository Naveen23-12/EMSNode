const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(express.json());

app.use(cors({
  origin: "http://127.0.0.1:5500"
}));

app.use("/api", require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));

app.listen(8080, () => console.log("Server running on port 8080"));