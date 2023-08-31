import Question from "../models/question.js";
import Category from "../models/category.js";
import User from "../models/user.js";
import expressAsyncHandler from "express-async-handler";

// get all questions
export const getAllQuestions = expressAsyncHandler(async (req, res) => {
  const questions = await Question.find({})
    .populate("user")
    .populate("category")
    .sort({ createdAt: -1 });
    
  const formattedQuestions = questions.map((question) => ({
    ...question.toObject(),
    user: {
      _id: question.user._id,
      name: question.user.name,
    },
  }));

  res.status(200).json(formattedQuestions);
});

// create a question
export const createQuestion = expressAsyncHandler(async (req, res) => {
  const { title, body, category } = req.body;

  if (!title || !body || !category) {
    res.status(422);
    throw new Error("All fields are required");
  }

  const question = await Question.create({
    title,
    body,
    user: req.user._id,
    answers: [],
    likes: [],
    category,
  });

  const questions = await Question.find({})
    .populate("user")
    .populate("category")
    .sort({ createdAt: -1 });

  const formattedQuestions = questions.map((question) => ({
    ...question.toObject(),
    user: {
      _id: question.user._id,
      name: question.user.name,
    },
  }));
  res.status(201).json(formattedQuestions);
});

// edit a question
export const editQuestion = expressAsyncHandler(async (req, res) => {
  const { title, body } = req.body;
  const { questionId } = req.params;

  if (!title || !body) {
    throw new Error("All fields are required");
  }

  const question = await Question.findOne({ _id: questionId });
  if (!question) {
    throw new Error("Question not found");
  }

  if (question.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("You are not allowed to edit this question");
  }

  question.title = title;
  question.body = body;

  await question.save();

  const questions = await Question.find({})
    .populate("user")
    .populate("category")
    .sort({ createdAt: -1 });

  const formattedQuestions = questions.map((question) => ({
    ...question.toObject(),
    user: {
      _id: question.user._id,
      name: question.user.name,
    },
  }));
  res.status(200).json(formattedQuestions);
});

// delete question
export const deleteQuestion = expressAsyncHandler(async (req, res) => {
  const { questionId } = req.params;

  const question = await Question.findOne({ _id: questionId });
  if (!question) {
    throw new Error("Question not found");
  }

  if (question.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("You are not allowed to edit this question");
  }

  const deleted = await Question.findOneAndDelete({ _id: questionId });

  const questions = await Question.find({})
    .populate("user")
    .populate("category")
    .sort({ createdAt: -1 });

  const formattedQuestions = questions.map((question) => ({
    ...question.toObject(),
    user: {
      _id: question.user._id,
      name: question.user.name,
    },
  }));
  res.status(200).json(formattedQuestions);
});

export const likeQuestion = expressAsyncHandler(async (req, res) => {
  const { questionId } = req.params;

  const question = await Question.findOne({ _id: questionId });
  const user = await User.findOne({ _id: req.user._id });
  if (!question || !user) {
    throw new Error("Error liking question");
  }

  if (question.likes.includes(req.user._id)) {
    question.likes = question.likes.filter(
      (like) => like.toString() !== req.user._id.toString()
    );
    user.likedQuestions = user.likedQuestions.filter(
      (like) => like.toString() !== questionId.toString()
    );
  } else {
    question.likes.push(req.user._id);
    user.likedQuestions.push(questionId);
  }

  await question.save();
  await user.save();
  const questions = await Question.find({})
    .populate("user")
    .populate("category")
    .sort({ createdAt: -1 });

  const formattedQuestions = questions.map((question) => ({
    ...question.toObject(),
    user: {
      _id: question.user._id,
      name: question.user.name,
    },
  }));
  res.status(200).json(formattedQuestions);
});
