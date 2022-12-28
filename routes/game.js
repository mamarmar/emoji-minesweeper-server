import express from "express";
import { startGame } from "../controllers/game.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/new", auth, startGame);

export default router;