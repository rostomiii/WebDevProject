
import { Router } from "express";

import {
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist
} from "../controllers/playlistController.js";

const router = Router();

// Routes for the playlist collection
router.route("/")
  .get(getPlaylists)
  .post(createPlaylist);

// Routes for a specific playlist
router.route("/:id")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

export default router;
