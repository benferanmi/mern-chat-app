import express from 'express';
import dotenv from "dotenv";
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from './lib/socket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const corsOptions = {
    origin: process.env.DEVELOPMENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

// **Apply CORS Middleware**
app.use(cors(corsOptions));

// **Global CORS Headers**
app.use((req, res, next) => {
    const origin = process.env.DEVELOPMENT_URL;
    console.log(origin)

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// **Middlewares**
app.use(express.json());
app.use(cookieParser());
connectDB();

// **Routes**
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// **Test Route**
app.get('/', (req, res) => {
    res.send("API is working");
});

// **Start Server**
server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
