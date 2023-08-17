import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    title: String,
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
