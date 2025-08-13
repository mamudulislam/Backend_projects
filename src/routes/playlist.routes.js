import { Router } from "express";
import {
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  getUserPlaylists,
  getPlaylistById,
} from "../controllers/playlist.controller.js";
import { verify } from "../middelwares/auth.middelwares.js";

const router = Router();

// Create playlist (protected)
router.post("/", verify, createPlaylist);

// Update playlist (protected)
router.put("/:playlistId", verify, updatePlaylist);

// Delete playlist (protected)
router.delete("/:playlistId", verify, deletePlaylist);

// Get all playlists of a user
router.get("/user/:userId", getUserPlaylists);

// Get a single playlist by ID
router.get("/:playlistId", getPlaylistById);

export default router;
