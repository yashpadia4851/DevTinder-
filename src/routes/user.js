const express = require("express");
const { userAuth } = require("../middleware/auth");
const { ConnectionRequest } = require("../modules/connectionRequest");
const { UserModel } = require("../modules/user");

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

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");
    //   .populate("fromUserId", "firstName")  this is for only check who is sender the req
    //   .populate("toUserId", "firstName");  this is for only check whom is sent

    const hideUserFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUserFromFeed.add(req.fromUserId.toString());
      hideUserFromFeed.add(req.toUserId.toString());
    });

    const usersData = await UserModel.find({
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    }).select(USER_SAFE_DATA);

    res.json({ message: "fetch proper done", usersData });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error creating request.", error: err.message });
  }
});

module.exports = { userRouter };
