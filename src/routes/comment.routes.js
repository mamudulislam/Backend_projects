import { Router } from "express";
import { verify } from "../middelwares/auth.middelwares.js";
import { getVideoComments, addComment } from "../controllers/comment.controller.js";

const router = Router();

router.get("/:videoId", verify, getVideoComments);

router.post("/:videoId", verify, addComment);

export default router;
