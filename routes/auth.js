import express from "express";
import { login, logout, refreshToken, signup } from "../controllers/auth.js";
import VerifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", signup);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.use(VerifyToken);
router.post("/logout", logout);

export default router;
