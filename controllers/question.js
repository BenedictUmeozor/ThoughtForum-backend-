import Question from "../models/question.js";
import expressAsyncHandler from "express-async-handler";

export const getAllQuestions = expressAsyncHandler(async (req, res) => {
  const questions = await Question.find({})
    .populate("user")
    .sort({ createdAt: -1 });
  res.status(200).json(questions);
});

export const createQuestion = expressAsyncHandler(async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    res.status(422);
    throw new Error("All fields are required");
  }
  res.status(200).json(req.user);
});
