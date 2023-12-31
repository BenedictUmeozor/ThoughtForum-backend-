import express from "express";
import {
  createAnswer,
  deleteAnswer,
  editAnswer,
  getAllAnswers,
  getAnswers,
  getUsersWhoLiked,
  likeAnswer,
} from "../controllers/answer.js";
import VerifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", getAllAnswers);
router.get("/:questionId", getAnswers);
router.get("/likes/:answerId", getUsersWhoLiked);

router.use(VerifyToken);

router.post("/", createAnswer);
router.post("/:answerId", likeAnswer);
router.delete("/:answerId", deleteAnswer);
router.put("/:answerId", editAnswer);

export default router;
