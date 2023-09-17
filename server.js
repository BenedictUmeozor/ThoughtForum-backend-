import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { NotFound, errorHandler } from "./middleware/error.js";
import AuthRoutes from "./routes/auth.js";
import QuestionRoutes from "./routes/question.js";
import AnswerRoutes from "./routes/answer.js";
import UserRoutes from "./routes/user.js";
import CategoryRoutes from "./routes/category.js";
import { logger } from "./middleware/logger.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT,
  })
);
app.use(express.json());
app.use(express.static("public"));
app.use(logger);

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT },
});

app.get("/", (req, res) => {
  res.sendFile("public/index.html");
});

app.use("/api/auth", AuthRoutes);
app.use("/api/questions", QuestionRoutes);
app.use("/api/answers", AnswerRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/categories", CategoryRoutes);

app.use(NotFound);
app.use(errorHandler);

let users = [];

io.on("connection", (socket) => {
  let userId;
  const socketId = socket.id;

  socket.on("login", (data) => {
    userId = data;
    users = users.filter((user) => user._id !== data);
    users.push({ _id: data, socketId });
    console.log(users);
  });

  socket.on("logout", (data) => {
    users = users.filter((user) => user._id !== data);
    userId = "";
  });

  socket.on("questionCreated", () => {
    socket.broadcast.emit("questionCreated");
  });

  socket.on("answerCreated", () => {
    socket.broadcast.emit("answerCreated");
  });

  socket.on("like", (data) => {
    const user = users.find((user) => user._id === data._id);
    if (user) {
      io.to(user.socketId).emit("like", data.name);
    }
  });

  socket.on("answer", (data) => {
    const user = users.find((user) => user._id === data._id);
    if (user) {
      io.to(user.socketId).emit("answer", data.name);
    }
  });

  socket.on("follow", (data) => {
    const user = users.find((user) => user._id === data._id);
    if (user) {
      io.to(user.socketId).emit("follow", data.name);
    }
  });

  socket.on("disconnect", () => {
    if (userId) {
      users = users.filter((user) => user._id !== userId);
      userId = "";
    }
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(
    server.listen(process.env.PORT, () =>
      console.log("Connected to DB and listening on port " + process.env.PORT)
    )
  )
  .catch((err) => console.log(err));
