const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "naveenkhan7299@gmail.com",
    pass: "orxm mxof hcsz vcwb"
  }
});

const sendMail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"EMS Application" <naveenlakshmi2312@gmail.com>`,
    to,
    subject,
    html
  });
};

module.exports = sendMail;