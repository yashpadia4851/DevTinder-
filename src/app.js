const express = require("express");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/database");

const { authRouter } = require("./routes/auth");
const { profileRouter } = require("./routes/profile");
const { requestRouter } = require("./routes/request");

const app = express();
// convert the json to js object and send the app.post api in the req to read properly
app.use(express.json());
app.use(cookieParser());

// Mount route modules
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => {
    console.log(error);
  });
