import express from "express";
import { isAuthenticated, isRecruiter } from "../middlewares/isAuthenticated.js";
import { getRecruiterJobs, getAllJobs, getJobById, postJob, updateJob, deleteJob } from "../controllers/job.controller.js";

const router = express.Router();

router.get("/recruiter", isAuthenticated, isRecruiter, getRecruiterJobs);
router.get("/", isAuthenticated, getAllJobs);
router.get("/:id", isAuthenticated, getJobById);

router.post("/post", isAuthenticated, isRecruiter, postJob);
router.patch("/post/:id", isAuthenticated, isRecruiter, updateJob);
router.delete("/post/:id", isAuthenticated, isRecruiter, deleteJob);

export default router;

