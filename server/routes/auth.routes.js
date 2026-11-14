import { Router } from "express";
import authCtrl from "../controllers/auth.controller.js";

const router = Router();
router.post("/api/auth/signin", authCtrl.signin);
router.post("/api/auth/signout", authCtrl.signout);
export default router;
