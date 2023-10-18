import User from "../models/user.js";
import expressAsyncHandler from "express-async-handler";

export const getUser = expressAsyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

export const getSpecificUser = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user);
});

export const editUser = expressAsyncHandler(async (req, res) => {
  const { name, gender, bio } = req.body;
  const user = await User.findById(req.user._id);

  if (!name || !gender || !bio) {
    res.status(404);
    throw new Error("all fields are required");
  }

  user.name = name;
  user.gender = gender;
  user.bio = bio;

  await user.save();
  res.status(200).json({ message: "success" });
});

export const followUser = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;

  const userToFollow = await User.findById(userId);
  const user = await User.findById(req.user._id);

  if (!userToFollow || !user) {
    throw new Error("Error following user");
  }

  if (userToFollow.followers.includes(user._id)) {
    userToFollow.followers = userToFollow.followers.filter(
      (user) => user.toString() !== user._id.toString()
    );
    user.following = user.following.filter(
      (user) => user.toString() !== userToFollow._id.toString()
    );
  } else {
    userToFollow.followers.push(user._id);
    user.following.push(userToFollow._id);
  }

  await userToFollow.save();
  await user.save();

  res.status(201).json({ message: "success" });
});

export const getFollowers = expressAsyncHandler(async (req, res) => {
  const followers = await Promise.all(
    req.user.followers.map((follower) => User.findById(follower))
  );

  const formattedFollowers = followers.map((follower) => ({
    _id: follower._id,
    name: follower.name,
    bio: follower.bio,
    gender: follower.gender,
    questions: follower.questions,
    following: follower.following,
    followers: follower.followers,
    likedQuestions: follower.likedQuestions,
    likedAnswers: follower.likedAnswers,
  }));

  res.status(200).json(formattedFollowers);
});

export const getUserFollowers = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  const followers = await Promise.all(
    user.followers.map((follower) => User.findById(follower))
  );

  const formattedFollowers = followers.map((follower) => ({
    _id: follower._id,
    name: follower.name,
    questions: follower.questions,
    following: follower.following,
    followers: follower.followers,
  }));

  res.status(200).json(formattedFollowers);
});

export const getUserFollowing = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const followers = await Promise.all(
      user.following.map(async (follower) => {
        const foundFollower = await User.findById(follower);
        return foundFollower || null;
      })
    );

    const formattedFollowers = followers
      .filter((follower) => follower !== null)
      .map((follower) => ({
        _id: follower._id,
        name: follower.name,
        questions: follower.questions,
        following: follower.following,
        followers: follower.followers,
      }));

    res.status(200).json(formattedFollowers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export const getTopMembers = expressAsyncHandler(async (req, res) => {
  const users = await User.find({});
  const formattedUsers = users.map((user) => ({
    _id: user._id,
    name: user.name,
    followers: user.followers,
    questions: user.questions,
  }));
  const topMembers = formattedUsers.sort(
    (a, b) => b.questions.length - a.questions.length
  );

  const top3Members = topMembers.slice(0, 3);

  res.status(200).json(top3Members);
});
