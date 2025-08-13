import { Router } from "express";
import { verify } from "../middelwares/auth.middelwares.js";
import { upload } from "../middelwares/multer.middelwares.js";
import {
  uploadVideo,
  getVideos,
  getVideoById,
  incrementViews,
} from "../controllers/video.controller.js";

const router = Router();

// Upload video (protected)
router.post(
  "/upload",
  verify,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo
);

// Get all videos
router.get("/", getVideos);

// Get video by ID
router.get("/:id", getVideoById);

// Increment view
router.post("/:id/views", incrementViews);

export default router;
