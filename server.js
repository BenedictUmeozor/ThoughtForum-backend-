import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { NotFound, errorHandler } from "./middleware/error.js";
import AuthRoutes from "./routes/auth.js";
import QuestionRoutes from "./routes/question.js";
import AnswerRoutes from "./routes/answer.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", AuthRoutes);
app.use("/api/questions", QuestionRoutes);
app.use("/api/answers", AnswerRoutes);

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
