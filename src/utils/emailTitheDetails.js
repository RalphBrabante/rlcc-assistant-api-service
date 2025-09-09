const fs = require("fs");
const path = require("path");
/**
 *
 * @param {string} firstName - giver's first name
 * @param {string} recipient - destination address
 * @param {float | string} amount - tithe amount
 * @param {string} titheType- tithe type name
 * @param {string} receivedDateRaw - received date.
 * @param {object} transporter - email transporter
 */

module.exports = (
  firstName,
  to,
  amount,
  titheType,
  receivedDateRaw,
  transporter
) => {
  // Get absolute path (recommended)
  const templatePath = path.resolve(
    __dirname,
    "../email-templates/createTithe.html"
  );
  let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  // convert date
  const date = new Date(receivedDateRaw);
  const receivedDate = date.toLocaleDateString("en-US");


  // Replace placeholders
  htmlTemplate = htmlTemplate.replace("{{name}}", firstName);
  htmlTemplate = htmlTemplate.replace("{{amount}}", amount);
  htmlTemplate = htmlTemplate.replace("{{titheType}}", titheType);
  htmlTemplate = htmlTemplate.replace("{{dateReceived}}", receivedDate);

  // Define email options
  const mailOptions = {
    from: '"RLCC Team" <test@sysgage.com>',
    to,
    subject: `Thank you for giving ${firstName}`,
    text: "This is a plain text email!",
    html: htmlTemplate,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error("Error sending email:", error);
    }
    console.log("Email sent:", info.response);
  });
};
