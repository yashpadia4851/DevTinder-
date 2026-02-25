const express = require("express");
const { connectDB } = require("./config/database");
const { UserModel } = require("./modules/user");
const app = express();
// convert the json to js object and send the app.post api in the req to read properly
app.use(express.json());

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
  const user = new UserModel(req.body);
  try {
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
