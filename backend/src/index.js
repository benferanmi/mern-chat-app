import express from 'express';
import dotenv from "dotenv";
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from './lib/socket.js';

dotenv.config();

const PORT = process.env.PORT || 5000; // Default port if not in env

// CORS Configuration
// const corsOptions = {
//     origin: "https://ben-mern-chat-frontend.vercel.app",
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true, // Allow cookies/auth headers
//     allowedHeaders: ["Content-Type"],
// };

// Middleware
// app.use(cors(corsOptions));


app.use(express.json());
app.use(cookieParser());
connectDB();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://ben-mern-chat-frontend.vercel.app");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight (OPTIONS request)
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});



// Routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.get('/', (req, res) => res.send("API working"));

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
