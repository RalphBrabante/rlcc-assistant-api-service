const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = 3000;
const routes = require("./routes");
const appErrorHandler = require('./middlewares/errorHandler');
const mailerTransporter = require("./middlewares/mailerTransporter");


// Middleware
app.use(cors());
app.use(express.json());

app.use(mailerTransporter)
app.use("/api/v1", routes);





//error handler
app.use(appErrorHandler)

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});