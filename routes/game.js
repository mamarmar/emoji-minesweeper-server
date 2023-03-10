import express from "express";
import { startGame, endGame, getPlatformStats, getPlatformTotals } from "../controllers/game.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/new", auth, startGame);

router.get("/platformstats", auth, getPlatformStats);
router.get("/platformtotalstats", auth, getPlatformTotals);

router.patch("/end/:id", auth, endGame);

export default router;