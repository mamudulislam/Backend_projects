import { Router } from "express";
import {
  registerUsers,
  loginUser,
  logoutUser,
  refreshaccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
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

// Refresh token route
router.post("/refresh-token", refreshaccessToken);

// Change password (protected)
router.post("/change-password", verify, changePassword);

// Get current user (protected)
router.get("/me", verify, getCurrentUser);

// Update account details (protected)
router.put("/me", verify, updateAccountDetails);

// Update user avatar (protected) — single file upload named 'avatar'
router.put("/me/avatar", verify, upload.single("avatar"), updateUserAvatar);

// Update user cover image (protected) — single file upload named 'coverImage'
router.put("/me/cover-image", verify, upload.single("coverImage"), updateUserCoverImage);

// Get user channel profile by userId (protected, userId optional in params)
router.get('/channel/:userId', verify, getUserChannelProfile);
router.get('/channel', verify, getUserChannelProfile);

// Get watch history (protected)
router.get("/watch-history", verify, getWatchHistory);

export default router;
