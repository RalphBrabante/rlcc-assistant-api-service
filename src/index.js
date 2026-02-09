const express = require("express");
require("dotenv").config();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const routes = require("./routes");
const appErrorHandler = require("./middlewares/errorHandler");
const responseFormatter = require("./middlewares/responseFormatter");
const mailerTransporter = require("./middlewares/mailerTransporter");
const securityHeaders = require("./middlewares/securityHeaders");
const requestSanitizer = require("./middlewares/requestSanitizer");
const { createRateLimiter } = require("./middlewares/rateLimit");
const initAmqp = require("./middlewares/initAmqp");
const titheConsumer = require("./consumers/titheConsumer");
const usersMigration = require("./consumers/usersMigration");
const { setupGroupChatSocket } = require("./realtime/groupChatSocket");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const localhostOrigins = [
  "http://localhost",
  "http://localhost:80",
  "http://localhost:4200",
  "http://localhost:8080",
  "http://127.0.0.1",
  "http://127.0.0.1:80",
  "http://127.0.0.1:4200",
  "http://127.0.0.1:8080",
  "https://bulkqrcodegenerator.online",
  "https://rlcc.bulkqrcodegenerator.online",
  "https://www.bulkqrcodegenerator.online",
];
const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : localhostOrigins;
const trustProxyValue = process.env.TRUST_PROXY;

function parseTrustProxy(value) {
  if (value === undefined) return undefined;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  if (/^\d+$/.test(normalized)) return Number(normalized);
  return value;
}

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (configuredOrigins.length === 0) return false;
  return configuredOrigins.includes(origin);
}

async function startServer() {
  const parsedTrustProxy = parseTrustProxy(trustProxyValue);
  if (parsedTrustProxy !== undefined) {
    app.set("trust proxy", parsedTrustProxy);
  }
  app.disable("x-powered-by");

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin(origin, callback) {
        if (isOriginAllowed(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    },
  });
  setupGroupChatSocket(io);
  app.set("io", io);

  // Middleware
  app.use(
    cors({
      origin(origin, callback) {
        if (isOriginAllowed(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );
  app.use(securityHeaders);
  app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "1mb" }));
  app.use(requestSanitizer);
  app.use(
    createRateLimiter({
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
      max: Number(process.env.RATE_LIMIT_MAX || 300),
    })
  );
  app.use(responseFormatter);

  const amqp = await initAmqp();

  // Register middleware BEFORE routes
  app.use((req, res, next) => {
    req.amqp = amqp; // now every req has { connection, channel }
    next();
  });

  app.use(mailerTransporter);
  app.use("/api/v1", routes);

  //error handler
  app.use(appErrorHandler);

  //consumers
  titheConsumer();
  usersMigration();

  // Start server
  server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
  });
}

startServer();
