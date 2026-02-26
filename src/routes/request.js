const express = require("express");
const { userAuth } = require("../middleware/auth");
const { ConnectionRequest } = require("../modules/connectionRequest");
const { UserModel } = require("../modules/user");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      // Validate status against allowed values in schema
      const allowedStatuses = ["ignored", "interested"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value." });
      }

      // Prevent sending request to yourself
      if (fromUserId.toString() === toUserId.toString()) {
        return res
          .status(400)
          .json({ message: "You cannot send a request to yourself." });
      }

      // Ensure the target user exists in the database
      const toUser = await UserModel.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({
          message:
            "The user you are trying to connect with was not found in our system.",
        });
      }

      // Check if a connection request already exists in either direction
      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingRequest) {
        return res.status(400).json({
          message:
            "A connection request between these users already exists and cannot be sent again.",
        });
      }

      const connectionReq = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionReq.save();

      const fromUserName = `${req.user.firstName} ${req.user.lastName}`;
      const toUserName = `${toUser.firstName} ${toUser.lastName}`;

      const responseMessage =
        status === "ignored"
          ? `${fromUserName} has ignored ${toUserName}.`
          : `${fromUserName} is interested in ${toUserName}.`;

      res.json({
        message: responseMessage,
        data,
      });
    } catch (err) {
      res
        .status(400)
        .json({ message: "Error creating request.", error: err.message });
    }
  },
);

requestRouter.post(
  "/request/review/:status/:requestedId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestedId } = req.params;
      const loggInUser = req.user;
      const allowedStatus = ["rejected", "accepted"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "the status is not valid" });
      }

      const connectionRequestHaveID = await ConnectionRequest.findOne({
        _id: requestedId,
        toUserId: loggInUser._id,
        status: "interested",
      });

      if (!connectionRequestHaveID) {
        return res
          .status(404)
          .json({ message: "Connection Request is not found" });
      }
      connectionRequestHaveID.status = status;

      const data = await connectionRequestHaveID.save();
      res.json({ message: "Connection Request: " + status, data });
    } catch (err) {
      res
        .status(400)
        .json({ message: "Error creating request.", error: err.message });
    }
  },
);

module.exports = { requestRouter };
