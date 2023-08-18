import express from "express";
import {
  createAnswer,
  deleteAnswer,
  editAnswer,
  getAnswers,
  likeAnswer,
} from "../controllers/answer.js";
import VerifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/:questionId", getAnswers);

router.use(VerifyToken);

router.post("/", createAnswer);
router.post("/:answerId", likeAnswer);
router.delete("/:answerId", deleteAnswer);
router.put("/:answerId", editAnswer);

export default router;
