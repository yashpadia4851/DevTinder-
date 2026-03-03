const url =
  "mongodb+srv://NamasteDevNode:l7RjWUzf26ywcfb3@namastenode.4bsac80.mongodb.net/devTinder";

const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(url);
};

module.exports = { connectDB };

// module.exports = connectDB;
