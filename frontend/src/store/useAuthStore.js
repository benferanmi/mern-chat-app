import { create } from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast";
import { io } from "socket.io-client"

const BASE_URL = import.meta.env.VITE_BASE_URL
console.log(BASE_URL)



export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,


    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data })
            get().connectSocket()

        } catch (error) {
            console.log("Error in checkAuth ", error);
            set({ authUser: null })
        } finally {
            set({ isCheckingAuth: false })
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });

        try {
            console.log(data)
            const res = await axiosInstance.post("/auth/signup", data)
            toast.success("Account Created SuccessfullyF")
            set({ authUser: res.data })
        } catch (error) {
            console.log(error.message);
            toast.error(error.response.data.message)

        } finally {
            set({ isSigningUp: false });

        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null })
            toast.success("Logged Out Successfully")
            get().disconnectSocket()
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message)

        }
    },

    login: async (data) => {
        set({ isLoggingIn: true })

        try {
            const response = await axiosInstance.post("/auth/login", data);
            set({ authUser: response.data })
            toast.success("Logged In successfully")

            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isLoggingIn: false })
        }
    },

    updateProfile: async (profilePic) => {
        set({ isUpdatingProfile: true })

        try {
            const response = await axiosInstance.put("/auth/update-profile", profilePic);
            set({ authUser: response.data })
            toast.success("Profile Image Updated Successfully")
        } catch (error) {
            console.log(error.message);
            toast.error(error.response.data.message)
        } finally {
            set({ isUpdatingProfile: false })

        }
    },

    connectSocket: () => {
        const { authUser } = get()

        if (!authUser || get().socket?.connected) return;
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id
            }
        })
        socket.connect();

        set({ socket: socket });

        //get onlien users 
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds })
        })
    },
    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect()
    },

}))


//3.41