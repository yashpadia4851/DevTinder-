const express = require("express");
const { userAuth } = require("../middleware/auth");
const Chat = require("../modules/chat");
const chatRouter = express.Router();

chatRouter.get("/chatDetails/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user?._id;
  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select : "firstName lastName"
    });
    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }
    res.json({ message: chat });
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: error });
  }
});

module.exports = { chatRouter };
