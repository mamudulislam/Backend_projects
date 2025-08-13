import { Router } from "express";
import {
  likeVideo,
  unlikeVideo,
  getVideoLikes,
} from "../controllers/like.controller.js";
import { verify } from "../middelwares/auth.middelwares.js";

const router = Router();

router.post("/:videoId", verify, likeVideo);
router.delete("/:videoId", verify, unlikeVideo);
router.get("/:videoId", getVideoLikes);

export default router;
