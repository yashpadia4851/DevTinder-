require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/database");

const { authRouter } = require("./routes/auth");
const { profileRouter } = require("./routes/profile");
const { requestRouter } = require("./routes/request");
const { userRouter } = require("./routes/user");
const cors = require("cors");

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const PORT = process.env.PORT || 3000;
// convert the json to js object and send the app.post api in the req to read properly
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

// Mount route modules
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
