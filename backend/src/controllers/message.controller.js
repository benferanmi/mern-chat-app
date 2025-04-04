import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId, io } from "../lib/socket.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"

const getUsersForSideBar = async (req, res) => {

    try {
        const loggedInUserId = req.user._id
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password")

        res.status(200).json(filteredUsers)
    } catch (error) {
        console.log("Error in getUsersForSidebar Controller", error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params
        const myId = req.user._id

        await Message.updateMany({}, { status: "seen" })

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })
        const updatedMessage = messages
        const receiverSocketId = getReceiverSocketId(userToChatId);

        res.status(200).json(messages)
        io.to(receiverSocketId).emit("messageUpdated", { updatedMessage, status: "multipleUpdate" })

    } catch (error) {
        console.log("Error in getMEssages Controller", error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const sendMessage = async (req, res) => {
    try {
        const text = req.body.text
        const replyTo = req.body.replyTo
        const image = req.file
        const { id: receiverId } = req.params
        const senderId = req.user._id

        console.log("this is replyTo from the client", replyTo)

        let imageUrl;
        if (image) {
            //Upload base64 image to cloudiary
            const uploadResponse = await cloudinary.uploader.upload(image.path, { resource_type: "image" })
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            replyTo,
            image: imageUrl
        })

        await newMessage.save()

        //todo: realtime functionality goes here => socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);

        if (receiverSocketId) {
            try {
                const updatedMessage = await Message.findByIdAndUpdate(newMessage._id, { status: "delivered" }, { new: true })
                io.to(receiverSocketId).emit("newMessage", updatedMessage)

            } catch (error) {
                console.log(error)
            }

        }

        res.status(201).json(newMessage)

    } catch (error) {
        console.log("Error in sendmessage Controller", error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const deleteMessage = async (req, res) => {
    const { messageId } = req.body
    console.log("delete message called", messageId)
    try {
        const response = await Message.findByIdAndDelete(messageId, {})

        res.status(200).json(response)

    } catch (error) {
        console.log(error, 'there is an error in the deleteMessage controller')
        res.status(500).json(error.message)
    }
}

const deleteallMessage = async () => {
    const ress = await Message.deleteMany({})
    if (ress) {
        console.log("deleted all messages")
    }
}

// deleteallMessage()


export { getUsersForSideBar, getMessages, sendMessage, deleteMessage }