import Question from "../models/question.js";
import Category from "../models/category.js";
import User from "../models/user.js";
import Answer from "../models/answer.js";
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
    category: {
      _id: question.category._id,
      title: question.category.title,
      questions: question.category.questions,
    },
  }));

  res.status(200).json(formattedQuestions);
});

// get a single question

export const getSingleQuestion = expressAsyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const question = await Question.findOne({ _id: questionId })
    .populate("user")
    .populate("category");

  const formattedQuestion = {
    ...question.toObject(),
    user: {
      _id: question.user._id,
      name: question.user.name,
      followers: question.user.followers,
    },
    category: {
      _id: question.category._id,
      title: question.category.title,
      questions: question.category.questions,
    },
  };
  res.status(200).json(formattedQuestion);
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

  const questionCategory = await Category.findOne({ _id: question.category });
  questionCategory.questions.push(question._id);

  const user = await User.findOne({ _id: req.user._id });
  user.questions.push(question._id);

  await questionCategory.save();
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
    category: {
      _id: question.category._id,
      title: question.category.title,
      questions: question.category.questions,
    },
  }));
  res.status(201).json(formattedQuestions);
});

// edit a question
export const editQuestion = expressAsyncHandler(async (req, res) => {
  const { title, body, category } = req.body;
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
  question.category = category;

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
    category: {
      _id: question.category._id,
      title: question.category.title,
      questions: question.category.questions,
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

  const questionCategory = await Category.findOne({ _id: question.category });
  questionCategory.questions = questionCategory.questions.filter(
    (question) => question.toString() !== question._id.toString()
  );

  const user = await User.findOne({ _id: req.user._id });
  user.questions = user.questions.filter(
    (question) => question.toString() !== question._id.toString()
  );

  await Answer.deleteMany({
    _id: { $in: question.answers.map((answer) => answer._id) },
  });

  await questionCategory.save();
  await user.save();
  await Question.findOneAndDelete({ _id: questionId });

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
    category: {
      _id: question.category._id,
      title: question.category.title,
      questions: question.category.questions,
    },
  }));
  res.status(200).json(formattedQuestions);
});

// Like a question

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
    category: {
      _id: question.category._id,
      title: question.category.title,
      questions: question.category.questions,
    },
  }));
  res.status(200).json(formattedQuestions);
});

// get category questions

export const getCategoryQuestions = expressAsyncHandler(
  expressAsyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const questions = await Question.find({ category: categoryId })
      .populate("user")
      .populate("category");

    const formattedQuestions = questions.map((question) => ({
      ...question.toObject(),
      user: {
        _id: question.user._id,
        name: question.user.name,
      },
      category: {
        _id: question.category._id,
        title: question.category.title,
        questions: question.category.questions,
      },
    }));
    res.status(200).json(formattedQuestions);
  })
);

// get hot questions

export const getHotquestions = expressAsyncHandler(async (req, res) => {
  const questions = await Question.find({})
    .populate("user")
    .populate("category");

  const formattedQuestions = questions.map((question) => ({
    ...question.toObject(),
    user: {
      _id: question.user._id,
      name: question.user.name,
    },
    category: {
      _id: question.category._id,
      title: question.category.title,
      questions: question.category.questions,
    },
  }));

  const hotQuestions = formattedQuestions.sort(
    (a, b) => b.answers.length - a.answers.length
  );

  const top3Questions = hotQuestions.slice(0, 3);

  res.status(200).json(top3Questions);
});

export const getTopQuestions = expressAsyncHandler(async (req, res) => {
  const questions = await Question.find({})
    .populate("user")
    .populate("category");

  const formattedQuestions = questions.map((question) => ({
    ...question.toObject(),
    user: {
      _id: question.user._id,
      name: question.user.name,
    },
    category: {
      _id: question.category._id,
      title: question.category.title,
      questions: question.category.questions,
    },
  }));

  const topQuestions = formattedQuestions.sort(
    (a, b) => b.answers.length - a.answers.length
  );

  res.status(200).json(topQuestions);
});

export const getFollowingQuestions = expressAsyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  const users = await Promise.all(
    user.following.map(async (user) => {
      return await User.findOne({ _id: user._id }).select("questions");
    })
  );
  const flattenedArray = [].concat(...users.map((item) => item.questions));

  const questions = await Promise.all(
    flattenedArray.map(async (question) => {
      return await Question.findOne({ _id: question })
        .populate("user")
        .populate("category");
    })
  );

  const formattedQuestions = questions.map((question) => ({
    ...question.toObject(),
    user: {
      _id: question.user._id,
      name: question.user.name,
    },
    category: {
      _id: question.category._id,
      title: question.category.title,
      questions: question.category.questions,
    },
  }));

  res.status(200).json(formattedQuestions);
});

export const relatedQuestions = expressAsyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const questions = await Question.find({ category: categoryId })
    .populate("user")
    .limit(3)
    .sort({ createdAt: -1 });

  const formattedQuestions = questions.map((question) => ({
    _id: question._id,
    title: question.title,
    body: question.body,
    user: {
      _id: question.user._id,
      name: question.user.name,
    },
  }));
  res.status(200).json(formattedQuestions);
});
