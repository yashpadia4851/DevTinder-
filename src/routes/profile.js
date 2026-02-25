const express = require("express");
const { userAuth } = require("../middleware/auth");

const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const userdetails = req.user;
    res.send(userdetails);
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

module.exports = { profileRouter };
