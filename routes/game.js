import express from "express";
import { startGame, endGame } from "../controllers/game.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/new", auth, startGame);

router.patch("/end/:id", auth, endGame);

export default router;