import { create } from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast";


export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],


    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data })
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
    }
}))