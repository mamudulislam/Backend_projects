import { Playlist } from "../models/playlist.model.js";

// Create playlist
export const createPlaylist = async (req, res) => {
  try {
    const { title, description, videos } = req.body;
    const newPlaylist = await Playlist.create({
      title,
      description,
      videos,
      user: req.user._id,
    });
    res.status(201).json(newPlaylist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update playlist
export const updatePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { title, description, videos } = req.body;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    if (playlist.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    playlist.title = title || playlist.title;
    playlist.description = description || playlist.description;
    playlist.videos = videos || playlist.videos;

    await playlist.save();
    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete playlist
export const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    if (playlist.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    await playlist.remove();
    res.status(200).json({ message: "Playlist deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's playlists
export const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.params.userId });
    res.status(200).json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get playlist by ID
export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
