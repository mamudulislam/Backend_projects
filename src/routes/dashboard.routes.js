import { Router } from "express";
import { getAdminDashboard } from "../controllers/dashboard.controller.js";
import { verify } from "../middelwares/auth.middelwares.js";

const router = Router();

router.get("/", verify, getAdminDashboard);

export default router;
