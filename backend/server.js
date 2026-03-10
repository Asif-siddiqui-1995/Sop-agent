import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";

import sopRoutes from "./routes/sopRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import sopQueryRoutes from "./routes/sopQueryRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
    })
    .then(() => {
        console.log("MongoDB Connected");
        console.log("DB NAME:", mongoose.connection.name);
        console.log("HOST:", mongoose.connection.host);
    })
    .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes

app.use("/api/sop", sopRoutes);
// app.use("/api/sop", searchRoutes);
// app.use("/api", testRoutes);
app.use("/api/sop", sopQueryRoutes);
app.use("/api/chat", chatRoutes);

// Multer error handling (after routes)
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({error: err.message});
    }
    next(err);
});

const PORT = process.env.PORT || 5000;
console.log("Mongo URI:", process.env.MONGO_URI);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
