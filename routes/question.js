import express from "express";
import { createQuestion, getAllQuestions } from "../controllers/question.js";
import VerifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", getAllQuestions);

router.use(VerifyToken);

router.post("/", createQuestion);

export default router;
