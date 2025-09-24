const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = 3000;
const routes = require("./routes");
const appErrorHandler = require("./middlewares/errorHandler");
const mailerTransporter = require("./middlewares/mailerTransporter");
const initAmqp = require("./middlewares/initAmqp");
const titheConsumer = require("./consumers/titheConsumer");

async function startServer() {
  // Middleware
  app.use(cors());
  app.use(express.json());

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

  // Start server
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
}

startServer();
