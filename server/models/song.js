import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    // Spotify's ID for the track. unique = no duplicate songs.
    // sparse = songs added without a Spotify ID are still allowed.
    spotifyId: { type: String, unique: true, sparse: true },
    title: { type: String, required: true, trim: true },
    artists: { type: [String], default: [] },
    album: { type: String, trim: true },
    imageUrl: String,
    durationMs: Number,
    genres: { type: [String], default: [] }, // useful for recommendations
    spotifyUrl: String,
  },
  { timestamps: true } // auto-adds createdAt and updatedAt
);

export default mongoose.model("Song", songSchema);