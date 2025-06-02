import express from "express";
import {
    login, logout, refreshToken, register, updateProfile, changePassword, getProfile,
    uploadCV, getCVs, getCV, updateCV, deleteCV, downloadCV, setPrimaryCV, setProfilePublic,
    addExperience, getExperience, updateExperience, deleteExperience,
    addEducation, getEducation, updateEducation, deleteEducation,
    getApplicantProfile, getApplicantPrimaryCV,
    getCurrentUser, updateProfileFromCV,
    saveJob, getSavedJobs, unsaveJob, setFindJobStatus, getFindJobStatus
} from "../controllers/user.controller.js";
import { isApplicant, isAuthenticated, isRecruiter } from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/register", singleUpload, register);
router.post("/login", login);
router.get("/me", isAuthenticated, getCurrentUser);
router.get("/logout", logout);
router.post("/refresh-token", refreshToken);
router.patch('/change-password', isAuthenticated, changePassword);

router.get("/profile", isAuthenticated, getProfile);
router.post("/profile/update", isAuthenticated, singleUpload, updateProfile);
router.post("/profile/update-from-cv", isAuthenticated, singleUpload, updateProfileFromCV)
router.patch("/profile/public", isAuthenticated, setProfilePublic);
router.patch("/profile/find-job", isAuthenticated, isApplicant, setFindJobStatus);
router.get("/profile/find-job-status", isAuthenticated, isApplicant, getFindJobStatus);
router.post("/profile/experience", isAuthenticated, addExperience);
router.get("/profile/experience", isAuthenticated, getExperience);
router.patch("/profile/experience/:id", isAuthenticated, updateExperience);
router.delete("/profile/experience/:id", isAuthenticated, deleteExperience);
router.post("/profile/education", isAuthenticated, addEducation);
router.get("/profile/education", isAuthenticated, getEducation);
router.patch("/profile/education/:id", isAuthenticated, updateEducation);
router.delete("/profile/education/:id", isAuthenticated, deleteEducation);

router.get("/cv", isAuthenticated, getCVs);
router.post("/cv/upload", isAuthenticated, singleUpload, uploadCV);
router.get("/cv/:cvId", isAuthenticated, getCV);
router.patch("/cv/:cvId", isAuthenticated, singleUpload, updateCV);
router.delete("/cv/:cvId", isAuthenticated, deleteCV);
router.patch("/cv/:cvId/primary", isAuthenticated, setPrimaryCV);
router.get("/cv/download/:cvId", isAuthenticated, downloadCV);

router.get("/applicant/:userId/profile", isAuthenticated, isRecruiter, getApplicantProfile);
router.get("/applicant/:userId/primary-cv", isAuthenticated, isRecruiter, getApplicantPrimaryCV);

router.post("/save-job/:id", isAuthenticated, isApplicant, saveJob);
router.get("/saved-jobs", isAuthenticated, isApplicant, getSavedJobs);
router.delete("/unsave-job/:id", isAuthenticated, isApplicant, unsaveJob);

export default router;

