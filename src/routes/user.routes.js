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
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUsers
);
router.post("/login", loginUser);
router.post("/logout", verify, logoutUser);
router.post("/refresh-token", refreshaccessToken);
router.post("/change-password", verify, changePassword);
router.get("/me", verify, getCurrentUser);
router.put("/me", verify, updateAccountDetails);
router.put("/me/avatar", verify, upload.single("avatar"), updateUserAvatar);
router.put("/me/cover-image", verify, upload.single("coverImage"), updateUserCoverImage);
router.get('/channel/:userId', verify, getUserChannelProfile);
router.get('/channel', verify, getUserChannelProfile);
router.get("/watch-history", verify, getWatchHistory);

export default router;