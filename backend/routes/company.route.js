import express from "express";
import { isAuthenticated, isRecruiter } from "../middlewares/isAuthenticated.js";
import { getCompany, registerCompany, updateCompany, getCompanyById } from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/get", isAuthenticated, isRecruiter, getCompany);
router.get("/:id", isAuthenticated, getCompanyById);
router.post("/register", isAuthenticated, isRecruiter, singleUpload, registerCompany);
router.patch("/update/:id", isAuthenticated, isRecruiter, singleUpload, updateCompany);

export default router;

