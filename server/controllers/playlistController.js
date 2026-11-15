
import mongoose from "mongoose";
import Playlist from "../models/playlist.js";
import Song from "../models/song.js";


// Check if the request comes from an authenticated user
const getUserId = (req) => req.auth?._id;

// GET /api/playlists
// Get all playlists belonging to the logged-in user
export const getPlaylists = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const playlists = await Playlist.find({ owner: userId })
      .sort({ createdAt: -1 });

    res.status(200).json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/playlists/:id
// Get a specific playlist
export const getPlaylistById = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      owner: userId
    }).populate("songs");

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/playlists
// Create a new playlist
export const createPlaylist = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, description } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Playlist name is required"
      });
    }

    const playlist = await Playlist.create({
      name,
      description: typeof description === "string" ? description : "",
      owner: userId,
      songs: []
    });

    res.status(201).json(playlist);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/playlists/:id
// Update playlist name or description
export const updatePlaylist = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }

    const updates = {};

    if (req.body.name !== undefined) {
      if (typeof req.body.name !== "string" || !req.body.name.trim()) {
        return res.status(400).json({
          message: "Playlist name cannot be empty"
        });
      }

      updates.name = req.body.name;
    }

    if (req.body.description !== undefined) {
      if (typeof req.body.description !== "string") {
        return res.status(400).json({
          message: "Description must be a string"
        });
      }

      updates.description = req.body.description;
    }

    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, owner: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    res.status(200).json(playlist);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/playlists/:id
// Delete a playlist owned by the logged-in user
export const deletePlaylist = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }

    const playlist = await Playlist.findOneAndDelete({
      _id: req.params.id,
      owner: userId
    });

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    res.status(200).json({
      message: "Playlist deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//
// POST /api/playlists/:id/songs
// Add a song to a playlist
//
export const addSongToPlaylist = async (req, res) => {
  try {
    const userId = getUserId(req);
    const playlistId = req.params.id;
    const songId = req.body?.songId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate MongoDB IDs
    if (!mongoose.isValidObjectId(playlistId) ||
        !mongoose.isValidObjectId(songId)) {
      return res.status(400).json({
        message: "Invalid playlist or song ID"
      });
    }

    // Check that the song exists
    const songExists = await Song.exists({ _id: songId });

    if (!songExists) {
      return res.status(404).json({
        message: "Song not found"
      });
    }

    // Add song only if the user owns the playlist
    const playlist = await Playlist.findOneAndUpdate(
      { _id: playlistId, owner: userId },
      { $addToSet: { songs: songId } },
      { new: true, runValidators: true }
    ).populate("songs");

    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found"
      });
    }

    return res.status(200).json(playlist);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to add song"
    });
  }
};

//
// DELETE /api/playlists/:id/songs/:songId
// Remove a song from a playlist
//
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id, songId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(id) ||
        !mongoose.isValidObjectId(songId)) {
      return res.status(400).json({
        message: "Invalid playlist or song ID"
      });
    }

    const playlist = await Playlist.findOneAndUpdate(
      { _id: id, owner: userId },
      { $pull: { songs: songId } },
      { new: true, runValidators: true }
    ).populate("songs");

    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found"
      });
    }

    return res.status(200).json(playlist);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to remove song"
    });
  }
};
