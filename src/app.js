const express = require("express");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/database");
const { UserModel } = require("./modules/user");
const { validationSignup } = require("./utils/validation");
const bcrypt = require("bcrypt");
const app = express();
const jwt = require("jsonwebtoken");
// convert the json to js object and send the app.post api in the req to read properly
app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  // Creating the new instance of the usermodole module
  try {
    validationSignup(req);
    const { firstName, lastName, emailId, password, age, gender } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);
    const user = new UserModel({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
      gender,
    });
    await user.save();
    res.send("user added");
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await UserModel.findOne({ emailId });

    if (!user) {
      throw new Error("the email id is not present in the database");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      // create the jwt token
      const token = await jwt.sign({ _id: user._id }, "Dev@Tinder$123");

      // Add the token to cookie and send the response back to the user
      res.cookie("token", token);
      res.send("login done");
    } else {
      throw new Error("password not correct");
    }
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

app.get("/profile", async (req, res) => {
  try {
    const cookies = req.cookies;
    const { token } = cookies;
    if (!token) throw new Error("invalid token");

    const decodedMessage = await jwt.verify(token, "Dev@Tinder$123");
    const { _id } = decodedMessage;
    const userdetails = await UserModel.findById(_id);
    if (!userdetails) throw new Error("user is not found");

    res.send(userdetails);
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

// find one user from the database
app.get("/user", async (req, res) => {
  const userEmailId = req.body.emailId;
  try {
    // const user = await UserModel.find({ emailId: userEmailId });
    const user = await UserModel.findOne({ emailId: userEmailId });

    if (!user) {
      return res.status(404).send("user not found");
    }

    res.send(user);
  } catch (err) {
    res.status(500).send("something went wrong");
  }
});

// find the all the user from the database
app.get("/feed", async (req, res) => {
  try {
    const users = await UserModel.find({});
    // res.send(users);
    if (users.length === 0) {
      res.status(404).send("user not found");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});

// delete one user from the database
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await UserModel.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).send("user id not found");
    }
    res.send(user);
  } catch (err) {
    res.status(500).send("something went wrong");
  }
});

app.patch("/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { emailId, ...data } = req.body;

  if (emailId) {
    return res.status(400).send("emailId cannot be updated");
  }

  try {
    const user = await UserModel.findByIdAndUpdate(userId, data, { new: true });

    if (!user) {
      return res.status(404).send("user id not found");
    }
    res.send(user);
  } catch (err) {
    res.status(500).send("something went wrong");
  }
});

app.post("/signup", async (req, res) => {
  // Creating the new instance of the usermodole module
  try {
    validationSignup(req);
    const { firstName, lastName, emailId, password, age, gender } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new UserModel({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
      gender,
    });
    await user.save();
    res.send("user added");
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

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
