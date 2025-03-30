import { Server } from "socket.io"
import http from "http"
import express from "express"
import Message from "../models/message.model.js";


const app = express();
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://ben-mern-chat-frontend.vercel.app/"]
    }
});
export function getReceiverSocketId(userId) {
    return userSocketMap[userId]
}
// used to store online users
const userSocketMap = {}

io.on("connection", (socket) => {
    console.log("A user connected", socket.id)

    const userId = socket.handshake.query.userId
    // Maps the userId to socket.id in userSocketMap
    if (userId) userSocketMap[userId] = socket.id

    //io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    //typing status
    socket.on("typing", ({ receiverId, senderId }) => {
        socket.to(getReceiverSocketId(receiverId)).emit("userTyping", { receiverId, senderId });
    });

    socket.on("stopTyping", ({ receiverId, senderId }) => {
        socket.to(getReceiverSocketId(receiverId)).emit("userStoppedTyping", { receiverId, senderId });
    });

    socket.on("messageSeen", async ({ messageId }) => {
        const updatedMessage = await Message.findByIdAndUpdate(messageId, { read: "seen" }, { new: true });

        const senderId = updatedMessage.senderId.toString()

        socket.to(getReceiverSocketId(senderId)).emit("messageUpdated", {updatedMessage, status:"singleUpdate"})
    })

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id)
        delete userSocketMap[userId]
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

export { io, app, server }