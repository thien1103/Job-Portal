import express from "express";
import { login, logout, refreshToken, register, updateProfile, changePassword } from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/register", singleUpload, register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/profile/update", isAuthenticated, singleUpload, updateProfile);
router.patch('/change-password', isAuthenticated, changePassword);

export default router;

