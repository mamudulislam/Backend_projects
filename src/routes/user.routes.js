import { Router } from "express";
import {
  registerUsers,
  loginUser,
  logoutUser,
  refreshaccessToken
} from "../controllers/user.controller.js";
import { upload } from "../middelwares/multer.middelwares.js";
import { verify } from "../middelwares/auth.middelwares.js"; 

const router = Router();

// Register route
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUsers
);

// Login route
router.post("/login", loginUser);

// Logout route (protected)
router.post("/logout", verify, logoutUser);
router.post("/refresh-token", refreshaccessToken);

export default router;
