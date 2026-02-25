const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { userAuth } = require("../middleware/auth");
const { validateEditProfileData } = require("../utils/validation");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const userdetails = req.user;
    res.send(userdetails);
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid edit request");
    }

    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();

    res.json({
      message: `Profile updated successfully, ${loggedInUser.firstName}.`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

// Change password for a logged-in user
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required." });
    }

    const loggedInUser = req.user;

    // Verify existing password
    const isCurrentPasswordValid = await loggedInUser.validatePassword(
      currentPassword,
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    // Ensure new password is strong
    if (!validator.isStrongPassword(newPassword)) {
      return res
        .status(400)
        .json({ message: "New password is not strong enough." });
    }

    // Hash and update the password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    loggedInUser.password = passwordHash;
    await loggedInUser.save();

    return res.json({ message: "Password updated successfully." });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error updating the password: " + err.message });
  }
});

module.exports = { profileRouter };
