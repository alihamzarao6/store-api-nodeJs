require("dotenv").config();
require("express-async-errors"); // do what the 'asyncWrapper' did in last project

const express = require("express");
const app = express();
const connectDB = require("./db/connect");
const productsRouter = require("./routes/products");

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// middlewares
app.use(express.json()); // although we're not using this in this project but its a syntax.

// routes
app.get("/", (req, res) => {
  res.send('<h1>Store API</h1><a href="/api/v1/products">products route</a>');
});

/* products routes */
app.use("/api/v1/products", productsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Database is connected and Server started on ${port}...`);
    });
  } catch (error) {
    console.log(error.message);
  }
};

startServer();
