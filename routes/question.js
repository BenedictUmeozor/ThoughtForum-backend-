import express from "express";
import {
  createQuestion,
  deleteQuestion,
  editQuestion,
  getAllQuestions,
  getHotquestions,
  getSingleQuestion,
  likeQuestion,
} from "../controllers/question.js";
import VerifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", getAllQuestions);
router.get("/:questionId", getSingleQuestion);
router.get("/hot-questions", getHotquestions);

router.use(VerifyToken);

router.post("/", createQuestion);
router.put("/:questionId", editQuestion);
router.delete("/:questionId", deleteQuestion);
router.post("/like/:questionId", likeQuestion);

export default router;
