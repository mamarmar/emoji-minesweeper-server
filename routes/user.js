import express from "express";
import { signup, login, logout, getUser, getPlayerStats } from "../controllers/user.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", auth, logout);

router.get("/stats", auth, getPlayerStats);
router.get("/:id", auth, getUser);


export default router;