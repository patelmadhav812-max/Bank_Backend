if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});
// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Bank-Backend" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
//Registration Email
const sendRegistrationEmail = async (userEmail, name) => {
  // ✅ add this
  let subject = "Welcome to Bank App! Registration Successful 🎉";
  let text = `Hello ${name}, your account has been successfully created.`;
  let html = `
    <h2>Hello ${name}! 👋</h2>
    <p>Welcome to <strong>Bank App</strong>.</p>
    <p>Your account has been <strong>successfully created</strong>.</p>
    <p>You can now login and start using our services.</p>
    <br/>
    <p>Thanks,</p>
    <p><strong>Bank App Team</strong></p>
  `;

  await sendEmail(userEmail, subject, text, html);
};
// Money Transfer Email
const sendMoneyTransferEmail = async (
  userEmail,
  name,
  amount,
  toUserAccountName,
) => {
  let subject = "Money Transfer Successful 🎉";
  let text = `Hello ${name}, your money has been successfully transferred.`;
  let html = `
  <h2>Hello ${name}! 👋</h2>
  <p>Your money of <strong>${amount}</strong> has been successfully transferred.</p>
  <p>Transferred to: <strong>${toUserAccountName}</strong></p>
  <p>You can now login and start using our services.</p>
  <br/>
  <p>Thanks,</p>
  <p><strong>Bank App Team</strong></p>
`;

  await sendEmail(userEmail, subject, text, html);
};
module.exports = { sendRegistrationEmail, sendMoneyTransferEmail };
