import express from "express";
import { login, refreshToken, signup } from "../controllers/auth.js";

const router = express.Router();

router.post("/", signup);
router.post("/login", login);
router.post("/refresh", refreshToken);

export default router;
