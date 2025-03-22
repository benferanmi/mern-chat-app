import express from 'express';
import dotenv from "dotenv";
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from './lib/socket.js';
import path from "path"

dotenv.config();

const PORT = process.env.PORT || 5000; // Default port if not in env
const __dirname = path.resolve()

// Middleware
app.use(cors({
    origin: process.env.DEVELOPMENT_URL,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
connectDB();


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.get('/', (req, res) => res.send("API working"));
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));

    })
}

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
