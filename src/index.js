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
const usersMigration = require("./consumers/usersMigration");

async function startServer() {
  //cors
  const allowedOrigins = ["https://rlcc.bulkqrcodegenerator.online"];

  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow mobile apps / curl / Postman
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
  };

  app.use(cors(corsOptions));

  // Middleware

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
  usersMigration();

  // Start server
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
}

startServer();
