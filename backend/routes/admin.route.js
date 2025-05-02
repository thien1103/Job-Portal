import express from "express";

import {
    deleteUser,
    getRecruiters, getAllUsers, getApplicants,
    getStatistics
} from "../controllers/admin.controller.js";
import { isAuthenticated, isAdmin } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/users", isAuthenticated, isAdmin, getAllUsers);
router.get("/users/applicants", isAuthenticated, isAdmin, getApplicants);
router.get("/users/recruiters", isAuthenticated, isAdmin, getRecruiters);
router.delete("/:id", isAuthenticated, isAdmin, deleteUser);
router.get("/statistics", isAuthenticated, isAdmin, getStatistics);

export default router;