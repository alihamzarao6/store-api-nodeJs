// This file will store the products which are present in 'package.json' file into our database. We will excute this file once in termminal using 'node populate.js' to do our work.

require("dotenv").config();

const connectDB = require("./db/connect");
const Product = require("./models/product");

const jsonProducts = require("./products.json");

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await Product.deleteMany();
    await Product.create(jsonProducts);

    console.log("Successfully connected");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

startServer();
