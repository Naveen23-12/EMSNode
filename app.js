const express = require("express");
const cors = require("cors");
const session = require("express-session");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(express.json());

app.use(cors({
  origin: "http://127.0.0.1:5500",
  credentials: true
}));

app.use(session({
  secret: "secret123",
  resave: false,
  saveUninitialized: false,
  cookie: {
     secure: false,
     httpOnly: true,
     sameSite: "lax"
    }
}));

app.use("/api", require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));

app.listen(8080, () => console.log("Server running on port 8080"));