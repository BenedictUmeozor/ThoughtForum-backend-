import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
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

mongoose
  .connect(process.env.MONGO_URI)
  .then(
    app.listen(process.env.PORT, () =>
      console.log("Connected to DB and listening on port " + process.env.PORT)
    )
  )
  .catch((err) => console.log(err));
