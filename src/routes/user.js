const express = require("express");
const { userAuth } = require("../middleware/auth");
const { ConnectionRequest } = require("../modules/connectionRequest");

const userRouter = express.Router();
const USER_SAFE_DATA = "firstName lastName photoURL about age gender";

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    res.json({ message: "Getting all the req", data: connectionRequests });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error creating request.", error: err.message });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);
    const data = connectionRequests.map((feild) => {
      if (feild.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return feild.toUserId;
      }
      return feild.fromUserId;
    });
    res.json({ message: "connections details", data });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error creating request.", error: err.message });
  }
});

module.exports = { userRouter };
