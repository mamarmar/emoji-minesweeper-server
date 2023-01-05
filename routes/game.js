import express from "express";
import { startGame, winGame, loseGame } from "../controllers/game.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/new", auth, startGame);

router.patch("/win/:id", auth, winGame);
router.patch("/lose/:id", auth, loseGame);

export default router;