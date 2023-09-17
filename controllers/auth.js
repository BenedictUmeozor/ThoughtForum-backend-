import expressAsyncHandler from "express-async-handler";
import isEmail from "validator/lib/isEmail.js";
import isStrongPassword from "validator/lib/isStrongPassword.js";
import User from "../models/user.js";
import RefreshToken from "../models/refreshToken.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const generateAccessToken = (_id) => {
  return jwt.sign({ _id: _id }, process.env.JWT_SECRET, { expiresIn: "1m" });
};

const generateRefreshToken = (_id) => {
  return jwt.sign({ _id: _id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const login = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Error("All fields are required");
  }
  const user = await User.findOne({ email });
  const isMatch = await bcrypt.compare(password, user.password);

  if (!user || !isMatch) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = await RefreshToken.findOneAndUpdate(
    { userId: user._id },
    { token: generateRefreshToken(user._id) },
    { new: true, upsert: true }
  );
  const data = {
    _id: user._id,
    accessToken,
    refreshToken: refreshToken.token,
  };

  res.status(200).json(data);
});

export const signup = expressAsyncHandler(async (req, res) => {
  const { name, password, email, gender } = req.body;
  if (!name || !password || !email || !gender) {
    throw new Error("All fields are required");
  }
  if (!isEmail(email)) {
    throw new Error("Please enter a valid email");
  }
  if (!isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
  const exists = await User.findOne({ email });
  if (exists) {
    throw new Error("User already exists");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({
    name,
    email,
    gender,
    password: hashedPassword,
    questions: [],
    following: [],
    followers: [],
    likedQuestions: [],
    likedAnswers: [],
  });
  const accessToken = generateAccessToken(user._id);
  const refreshToken = await RefreshToken.create({
    token: generateRefreshToken(user._id),
    userId: user._id,
  });
  const data = {
    _id: user._id,
    accessToken,
    refreshToken: refreshToken.token,
  };

  res.status(201).json(data);
});

export const refreshToken = expressAsyncHandler(async (req, res) => {
  const { token } = req.body;

  const tokenExists = await RefreshToken.exists({ token });

  if (!tokenExists) {
    res.status(401);
    throw new Error("Token does not exist");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  const newRefreshToken = await RefreshToken.findOneAndUpdate(
    { userId: decoded._id },
    { token: generateRefreshToken(decoded._id) },
    { new: true }
  );
  const newAccessToken = generateAccessToken(decoded._id);

  const data = {
    _id: decoded._id,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken.token,
  };

  res.status(201).json(data);
});

export const logout = expressAsyncHandler(async (req, res) => {
  const { token } = req.body;
  const tokenExists = await RefreshToken.exists({ token });
  if (!tokenExists) {
    res.status(401);
    throw new Error("Token does not exist");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  await RefreshToken.findOneAndDelete({ userId: decoded._id });
  res.status(200).json({ message: "Logged out" });
});
