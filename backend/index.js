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
        console.log("Incoming origin:", origin);

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn("Blocked by CORS policy:", origin);
            // callback(new Error("Not allowed by CORS"));
            callback(null, false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}


app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;


app.use("/user", userRoute);
app.use("/company", companyRoute);
app.use("/job", jobRoute);
app.use("/application", applicationRoute);
app.use("/admin", adminRoute);

app.use((req, res, next) => {
    res.status(404).json({
        message: `Route not found: ${req.originalUrl}`,
        status: 'fail',
    });
});

app.use(errorHandler);


app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server running at port ${PORT}`);
    // Initial job sync
    try {
        await RecombeeService.syncJobs();
    } catch (error) {
        console.error('Initial job sync failed:', error);
    }
});