
import { Router } from "express";

import authCtrl from "../controllers/auth.controller.js";

import {
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist
} from "../controllers/playlistController.js";

const router = Router();

// Protect every playlist route
router.use(authCtrl.requireSignin);

// Playlist CRUD
router.route("/")
  .get(getPlaylists)
  .post(createPlaylist);

// Add a song to a playlist
router.post("/:id/songs", addSongToPlaylist);

// Remove a song from a playlist
router.delete("/:id/songs/:songId", removeSongFromPlaylist);

// Individual playlist CRUD
router.route("/:id")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

export default router;
