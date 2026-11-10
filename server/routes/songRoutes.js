import { Router } from "express";
import {
  getSongs, getSongById, createSong, updateSong, deleteSong,
} from "../controllers/songController.js";

const router = Router();

router.route("/").get(getSongs).post(createSong);
router.route("/:id").get(getSongById).put(updateSong).delete(deleteSong);

export default router;