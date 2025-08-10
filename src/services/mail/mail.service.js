const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendAstrologerApprovalMail = async (email, name, password) => {
  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: email,
    subject: "You are selected as Astrologer on AstroWorld",
    html: `
      <h3>Hello ${name},</h3>
      <p>Congratulations! You have been selected as an astrologer on <b>AstroWorld</b>.</p>
      <p>Your account has been created. Please use the following credentials to log in:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>You can now start offering your services on the platform.</p>
      <br/>
      <p>Regards,<br/>AstroWorld Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Approval email sent to", email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
const sendAstrologerRejectionMail = async (email, name) => {
  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: email,
    subject: "AstroWorld Application Status",
    html: `
      <h3>Hello ${name},</h3>
      <p>Thank you for your interest in joining <b>AstroWorld</b> as an astrologer.</p>
      <p>We appreciate the time and effort you put into your application. After careful review, we regret to inform you that your application has not been selected at this time.</p>
      <p>This decision does not reflect your qualifications or experience negatively. You may apply again in the future when applications reopen.</p>
      <br/>
      <p>Wishing you all the best in your endeavors.</p>
      <p>Regards,<br/>AstroWorld Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Rejection email sent to", email);
  } catch (error) {
    console.error("Error sending rejection email:", error);
  }
};
module.exports = { sendAstrologerApprovalMail, sendAstrologerRejectionMail };
