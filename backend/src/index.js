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
const allowedOrigins = ["https://ben-mern-chat-frontend.vercel.app", "http://localhost:5173"];

const corsOptions = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};


app.use(cors(corsOptions));

// // Manually Handle Preflight Requests this is for when i am using vercel
// app.use((req, res, next) => {
//     const origin = req.headers.origin;
//     if (allowedOrigins.includes(origin)) {
//         res.header("Access-Control-Allow-Origin", origin);
//     }
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//     res.header(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested-With, Content-Type, Authorization"
//     );
//     res.header("Access-Control-Allow-Credentials", "true"); // Allow cookies
//     if (req.method === "OPTIONS") {
//         return res.sendStatus(200);
//     }
//     next();
// });


app.use(express.json())
app.use(cookieParser());
connectDB();

app.use("/api/auth", authRoutes)
app.use("/api/message", messageRoutes)

app.get('/', (req, res) => (
    res.send("Api working")
))

server.listen(PORT, () => {
    console.log("server is running on port:" + PORT)
})

