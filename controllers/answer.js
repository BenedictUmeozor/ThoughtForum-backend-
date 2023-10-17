import expressAsyncHandler from "express-async-handler";
import Answer from "../models/answer.js";
import Question from "../models/question.js";
import User from "../models/user.js";

export const getAllAnswers = expressAsyncHandler(async (req, res) => {
  const answersCount = await Answer.find({}).count();
  res.status(200).json({ answersCount: answersCount });
});

export const getAnswers = expressAsyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const answers = await Answer.find({ question: questionId })
    .populate("user")
    .sort({ createdAt: 1 });

  const formattedAnswers = answers.map((answer) => ({
    ...answer.toObject(),
    user: {
      _id: answer.user._id,
      name: answer.user.name,
    },
  }));

  res.status(200).json(formattedAnswers);
});

export const createAnswer = expressAsyncHandler(async (req, res) => {
  const { text, question } = req.body;
  const { _id } = req.user._id;

  if (!text || !question) {
    res.status(422);
    throw new Error("All fields are required");
  }

  const questionToAnswer = await Question.findOne({ _id: question });

  if (!questionToAnswer) {
    res.status(404);
    throw new Error("Question does not exist");
  }

  const answer = await Answer.create({
    text,
    question,
    user: _id,
    likes: [],
  });

  questionToAnswer.answers.push(answer._id);
  await questionToAnswer.save();

  res.status(201).json(answer);
});

export const editAnswer = expressAsyncHandler(async (req, res) => {
  const { answerId } = req.params;
  const { text } = req.body;

  if (!text) {
    res.status(422);
    throw new Error("All fields are required");
  }
  const answer = await Answer.findOne({ _id: answerId });

  if (!answer) {
    res.status(404);
    throw new Error("Answer not found");
  }

  if (answer.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("You are not allowed to edit this answer");
  }

  answer.text = text;
  await answer.save();

  res.status(200).json(answer);
});

export const deleteAnswer = expressAsyncHandler(async (req, res) => {
  const { answerId } = req.params;
  const answer = await Answer.findOne({ _id: answerId }).populate("question");

  if (!answer) {
    res.status(404);
    throw new Error("Answer not found");
  }

  if (answer.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("You are not allowed to delete this answer");
  }

  const question = await Question.findOne({ _id: answer.question._id });

  if (!question) {
    res.status(404);
    throw new Error("Question in reference not found");
  }

  question.answers = question.answers.filter(
    (ans) => ans.toString() !== answer._id.toString()
  );
  await Answer.findOneAndDelete({ _id: answerId });
  await question.save();
  res.status(200).json({ message: "Answer deleted" });
});

export const likeAnswer = expressAsyncHandler(async (req, res) => {
  const { answerId } = req.params;
  const answer = await Answer.findOne({ _id: answerId });
  const user = await User.findOne({ _id: req.user._id });

  if (!answer || !user) {
    res.status(404);
    throw new Error("Error liking answer");
  }

  if (answer.likes.includes(req.user._id)) {
    answer.likes = answer.likes.filter(
      (answer) => answer.toString() !== req.user._id.toString()
    );
    user.likedAnswers = user.likedAnswers.filter(
      (like) => like.toString() !== answerId.toString()
    );
  } else {
    answer.likes.push(req.user._id);
    user.likedAnswers.push(answerId);
  }

  await answer.save();
  await user.save();

  res.status(200).json({ message: "sucessful" });
});

export const getUsersWhoLiked = expressAsyncHandler(async (req, res) => {
  const { answerId } = req.params;

  const answer = await Answer.findOne({ _id: answerId });

  const users = await Promise.all(
    answer.likes.map((user) => User.findById(user))
  );

  const formattedUsers = users.map((user) => ({
    _id: user._id,
    name: user.name,
    questions: user.questions,
    following: user.following,
    followers: user.followers,
  }));

  res.status(200).json(formattedUsers);
});
