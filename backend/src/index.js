import express from 'express'
import dotenv from "dotenv"
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import { connectDB } from './lib/db.js'
import cookieParser from "cookie-parser"
import cors from "cors"
import { app, server } from './lib/socket.js'

dotenv.config()

const PORT = process.env.PORT

const corsOptions = {
    origin: ["https://ben-mern-chat-frontend.vercel.app", "http://localhost:5173"], 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow cookies/auth headers if needed
  };


app.use(express.json())
app.use(cookieParser());
app.use(cors(corsOptions))

app.use("/api/auth", authRoutes)
app.use("/api/message", messageRoutes)

app.get('/', (req, res) => (
    res.send("Api working")
))

server.listen(PORT, () => {
    console.log("server is running on port:" + PORT)
    connectDB()
})

