// src/routes/subscription.routes.js
import { Router } from "express";
import { verify } from "../middelwares/auth.middelwares.js";
import { subscribe, unsubscribe } from "../controllers/subscription.controller.js";

const router = Router();

router.post("/:channelId", verify, subscribe);
router.delete("/:channelId", verify, unsubscribe);

export default router;
