import mongoose from "mongoose";
import Song from "../models/song.js";

// Only these fields can be set by a request. This stops someone sending
// { "_id": ... } or other fields you never meant to accept.
const pickSongFields = (body) => {
  const { spotifyId, title, artists, album, imageUrl, durationMs, genres, spotifyUrl } = body;
  return { spotifyId, title, artists, album, imageUrl, durationMs, genres, spotifyUrl };
};

// GET /api/songs
export const getSongs = async (req, res) => {
  const songs = await Song.find().sort({ createdAt: -1 });
  res.json(songs);
};

// GET /api/songs/:id
export const getSongById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid song ID" });
  }
  const song = await Song.findById(req.params.id);
  if (!song) return res.status(404).json({ message: "Song not found" });
  res.json(song);
};

// POST /api/songs
export const createSong = async (req, res) => {
  try {
    const song = await Song.create(pickSongFields(req.body));
    res.status(201).json(song);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Song already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    throw error;
  }
};

// PUT /api/songs/:id
export const updateSong = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid song ID" });
  }
  const song = await Song.findByIdAndUpdate(req.params.id, pickSongFields(req.body), {
    returnDocument: "after", // return the updated version, not the old one
    runValidators: true,     // still enforce "title is required" etc.
  });
  if (!song) return res.status(404).json({ message: "Song not found" });
  res.json(song);
};

// DELETE /api/songs/:id
export const deleteSong = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid song ID" });
  }
  const song = await Song.findByIdAndDelete(req.params.id);
  if (!song) return res.status(404).json({ message: "Song not found" });
  res.json({ message: "Song deleted" });
};