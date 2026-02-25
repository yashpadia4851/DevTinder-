const express = require("express");
const authRouter = express.Router();
const { validationSignup } = require("../utils/validation");
const { UserModel } = require("../modules/user");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
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

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await UserModel.findOne({ emailId });

    if (!user) {
      throw new Error("Invalid email");
    }
    // bcrypt.compare(password, user.password);

    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      // create the jwt token
      const token = await user.getJWT();

      // Add the token to cookie and send the response back to the user
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
      }); // 1d expire of the cookies
      res.send("login done");
    } else {
      throw new Error("password not correct");
    }
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", "", { expires: new Date(0) });
  res.send("logout done");
});

module.exports = { authRouter };
