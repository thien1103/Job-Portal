import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/db.js";

import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import adminRoute from "./routes/admin.route.js";
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config({});

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:10000",
    "https://job-portal-4cda.onrender.com"
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;


// api's
app.use("/user", userRoute);
app.use("/company", companyRoute);
app.use("/job", jobRoute);
app.use("/application", applicationRoute);
app.use("/admin", adminRoute),

    app.use(errorHandler);

app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server running at port ${PORT}`);
})