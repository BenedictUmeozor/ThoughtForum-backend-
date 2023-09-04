import expressAsyncHandler from "express-async-handler";
import Category from "../models/category.js";

export const getCategories = expressAsyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.status(200).json(categories);
});
