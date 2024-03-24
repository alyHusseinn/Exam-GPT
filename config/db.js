const mongoose = require("mongoose");
const { MONGO_URL } = require("./env");

const connectDatabase = () =>
  mongoose
    .connect(MONGO_URL)
    .then(() => {
      console.log("Database connected");
    })
    .catch((err) => console.error(err));

module.exports = connectDatabase;
