import { create } from "zustand"
import toast from "react-hot-toast"
import { axiosInstance } from "../lib/axios"
import { useAuthStore } from "./useAuthStore";


export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isTyping: false,
    displayTypingMessage: false,
    displayTypingForId: null,
    setTyping: (typing) => set({ isTyping: typing }),

    getUsers: async () => {

        set({ isUsersLoading: true });

        try {
            const res = await axiosInstance.get("/message/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {

        set({ isMessagesLoading: true });

        try {
            const res = await axiosInstance.get(`/message/${userId}`)
            set({ messages: res.data })
        } catch (error) {
            toast.error(error.response.data.message);

        } finally {
            set({ isMessagesLoading: false });

        }

    },

    deleteMessage: async (messageId) => {
        try {
            const res = await axiosInstance.post("/message/delete", { messageId })
            console.log(res)
            set({ messages: [...get().messages.filter((message) => message._id !== res.data._id)] })
        } catch (error) {
            console.log(error)
        }
    },

    sendMessages: async (formdata) => {
        const { selectedUser, messages } = get()

        try {
            const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, formdata);
            set({ messages: [...messages, res.data] })
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get()
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {

            const isMessageSendFromSelectedUser = newMessage.senderId === selectedUser._id
            if (!isMessageSendFromSelectedUser) return;
            set({ messages: [...get().messages, newMessage] })
            const messageId = newMessage._id
            socket.emit("messageSeen", { messageId })
        })

    },

    checkIfMessageIsUpdated: async () => {
        const socket = useAuthStore.getState().socket;

        socket.on("messageUpdated", async (data) => {
            const { updatedMessage, status } = data;
            if (status === "singleUpdate") {
                set({ messages: [...get().messages.map((message) => message._id === updatedMessage._id ? updatedMessage : message)] })
            }
            if (status === "multipleUpdate") {
                set({ messages: updatedMessage })
            }
        })
    },


    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage")
    },

    isUserTypingMessage: () => {
        const { isTyping, selectedUser } = get()
        const socket = useAuthStore.getState().socket;
        const receiverId = selectedUser._id
        const senderId = useAuthStore.getState().authUser._id

        if (isTyping) {
            socket.emit("typing", { receiverId, senderId })
        }
    },

    isUserStoppedTyping: () => {
        const { isTyping, selectedUser } = get()
        const socket = useAuthStore.getState().socket;
        const senderId = useAuthStore.getState().authUser._id

        const receiverId = selectedUser._id
        if (!isTyping) {
            socket.emit("stopTyping", { receiverId, senderId })
            // console.log("user is not typing")
        }
    },

    displayUserTypingMessage: () => {
        const socket = useAuthStore.getState().socket;

        socket.on("userTyping", ({ senderId }) => {
            set({ displayTypingMessage: true });
            set({ displayTypingForId: senderId })

        })

    },

    displayUserStoppedTyping: () => {
        const socket = useAuthStore.getState().socket;

        socket.on("userStoppedTyping", () => {
            set({ displayTypingMessage: false });
            set({ displayTypingForId: "" })
        })
    },

    // todo:optimize this one later
    setSelectedUser: (selectedUser) => set({ selectedUser })
}))


//the user that us not online, the message is being updated to seen i need to fix that too