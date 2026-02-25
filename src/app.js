const express = require("express");
const { connectDB } = require("./config/database");
const { UserModel } = require("./modules/user");
const app = express();
// convert the json to js object and send the app.post api in the req to read properly
app.use(express.json());

app.post("/signup", async (req, res) => {
  console.log(req.body, "apicall22222");

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
