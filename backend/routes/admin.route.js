import express from "express";

import {
    deleteUser, deleteCompany, getAllCompanies,
    getRecruiters, getAllUsers, getApplicants,
    getStatistics
} from "../controllers/admin.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/users", isAuthenticated, isAdmin, getAllUsers);
router.delete("/users/:id", isAuthenticated, isAdmin, deleteUser);
router.get("/users/applicants", isAuthenticated, isAdmin, getApplicants);
router.get("/users/recruiters", isAuthenticated, isAdmin, getRecruiters);

router.get("/companies", isAuthenticated, isAdmin, getAllCompanies);
router.delete("/companies/:id", isAuthenticated, isAdmin, deleteCompany);

router.get("/statistics", isAuthenticated, isAdmin, getStatistics);

export default router;