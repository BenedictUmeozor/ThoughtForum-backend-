import express from "express";
import {
  createQuestion,
  deleteQuestion,
  editQuestion,
  getAllQuestions,
  getCategoryQuestions,
  getFollowingQuestions,
  getHotquestions,
  getSingleQuestion,
  getTopQuestions,
  getUsersWhoLiked,
  likeQuestion,
  relatedQuestions,
} from "../controllers/question.js";
import VerifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", getAllQuestions);
router.get("/hot-questions", getHotquestions);
router.get("/top-questions", getTopQuestions);
router.get("/following-questions", VerifyToken, getFollowingQuestions);
router.get("/likes/:questionId", getUsersWhoLiked)
router.get("/related-questions/:categoryId", relatedQuestions);
router.get("/category/:categoryId", getCategoryQuestions);
router.get("/:questionId", getSingleQuestion);

router.use(VerifyToken);

router.post("/", createQuestion);
router.put("/:questionId", editQuestion);
router.delete("/:questionId", deleteQuestion);
router.post("/like/:questionId", likeQuestion);

export default router;
