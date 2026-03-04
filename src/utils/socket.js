const socket = require("socket.io");
const Chat = require("../modules/chat");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomID = [userId, targetUserId].sort().join("_");
      console.log(roomID, "roomId");
      socket.join(roomID);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, userId, targetUserId, text }) => {
        try {
          const roomID = [userId, targetUserId].sort().join("_");

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId, // ✅ correct
            text,
          });

          await chat.save();

          const lastMessage = chat.messages[chat.messages.length - 1];

          io.to(roomID).emit("messageReceived", {
            messageId: lastMessage._id,
            firstName,
            text: lastMessage.text,
            createdAt: lastMessage.createdAt,
            senderId: userId,
          });
        } catch (error) {
          console.log("Message Save Error:", error);
        }
      },
    );
    socket.on("disconnected", () => {});
  });
};

module.exports = initializeSocket;
