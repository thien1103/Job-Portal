import express from "express";
import {
    login, logout, refreshToken, register, updateProfile, changePassword,
    addExperience, addEducation, getProfile,
    uploadCV, getCVs, getCV, updateCV, deleteCV
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/register", singleUpload, register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", isAuthenticated, getProfile);
router.post("/profile/update", isAuthenticated, singleUpload, updateProfile);
router.post("/profile/experience", isAuthenticated, addExperience);
router.post("/profile/education", isAuthenticated, addEducation);
router.patch('/change-password', isAuthenticated, changePassword);

router.get("/cv", isAuthenticated, getCVs);
router.post("/cv/upload", isAuthenticated, singleUpload, uploadCV);
router.get("/cv/:cvId", isAuthenticated, getCV);
router.patch("/cv/:cvId", isAuthenticated, singleUpload, updateCV);
router.delete("/cv/:cvId", isAuthenticated, deleteCV);

export default router;

