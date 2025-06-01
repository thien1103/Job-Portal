import express from "express";
import { isApplicant, isAuthenticated, isRecruiter } from "../middlewares/isAuthenticated.js";
import {
    getRecruiterJobs, getAllJobs, getJobById, postJob, updateJob, deleteJob,
    getApplicationDetails, getJobApplicants, getApplicantDetails,
    searchJobs, getRecommendedJobs
} from "../controllers/job.controller.js";

const router = express.Router();

router.get("/recruiter", isAuthenticated, isRecruiter, getRecruiterJobs);
router.get("/search", searchJobs);
router.get("/recommended-jobs", isAuthenticated, isApplicant, getRecommendedJobs);
router.get("/", getAllJobs);
router.get("/:id", getJobById);
router.get("/:id/applications", isAuthenticated, isRecruiter, getJobApplicants);
router.get("/:id/applications/:applicationId", isAuthenticated, isRecruiter, getApplicationDetails);
router.get("/applications/:id", isAuthenticated, isRecruiter, getApplicantDetails);


router.post("/post", isAuthenticated, isRecruiter, postJob);
router.patch("/post/:id", isAuthenticated, isRecruiter, updateJob);
router.delete("/post/:id", isAuthenticated, isRecruiter, deleteJob);


export default router;

