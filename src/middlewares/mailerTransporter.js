const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const host = String(process.env.SMTP_HOST || "").trim();
  const port = Number(process.env.SMTP_PORT || 465);
  const secureEnv = String(process.env.SMTP_SECURE || "").trim().toLowerCase();
  const secure =
    secureEnv === "true" ? true : secureEnv === "false" ? false : port === 465;
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "").trim();

  if (!host || !user || !pass || !Number.isFinite(port) || port < 1) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    auth: { user, pass },
  });

  return transporter;
}

module.exports = (req, res, next) => {
  req.transporter = getTransporter();
  next();
};
