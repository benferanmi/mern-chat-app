import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log(`Mongodb connected`)

    } catch (error) {
        console.log(`Mongodb connection error:`, error)

    }
}