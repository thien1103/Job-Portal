import express from "express";
import { isAuthenticated, isApplicant, isRecruiter } from "../middlewares/isAuthenticated.js";
import { applyJob, getApplicants, getAppliedJobs, updateStatus, deleteApplication } from "../controllers/application.controller.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/apply/:id", isAuthenticated, isApplicant, singleUpload, applyJob);
router.get("/get", isAuthenticated, isApplicant, getAppliedJobs);
router.get("/:id/applicants", isAuthenticated, isRecruiter, getApplicants);
router.post("/status/:id/update", isAuthenticated, isRecruiter, updateStatus);
router.delete("/:id", isAuthenticated, isRecruiter, deleteApplication);


export default router;

