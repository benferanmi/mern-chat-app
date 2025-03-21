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
const corsOptions = {
    origin: ["https://ben-mern-chat-frontend.vercel.app", "http://localhost:5173"], 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow cookies/auth headers
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
connectDB();


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.get('/', (req, res) => res.send("API working"));

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
