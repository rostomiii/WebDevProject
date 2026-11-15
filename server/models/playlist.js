
import mongoose from "mongoose";

// Define the structure of a playlist in MongoDB
const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: "",
      trim: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song"
      }
    ]
  },
  {
    timestamps: true
  }
);

// Create and export the Playlist model
export default mongoose.model("Playlist", playlistSchema);
