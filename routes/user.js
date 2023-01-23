import express from "express";
import { signup, login, logout, getUser, deleteUser, getPlayerStats, getPlayerTotals, getBestMovesRanking, getBestTimeRanking } from "../controllers/user.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", auth, logout);

router.get("/stats", auth, getPlayerStats);
router.get("/totalstats", auth, getPlayerTotals);
router.get("/bestmoves", auth, getBestMovesRanking);
router.get("/besttime", auth, getBestTimeRanking);
router.get("/:id", auth, getUser);

router.delete(":/id", auth, deleteUser);


export default router;