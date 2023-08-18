import express from "express";
import VerifyToken from "../middleware/verifyToken.js";
import {
  editUser,
  followUser,
  getFollowers,
  getSpecificUser,
  getUser,
  getUserFollowers,
} from "../controllers/user.js";

const router = express.Router();

router.get('/followers',VerifyToken, getFollowers)
router.get("/:userId", getSpecificUser);
router.get('/followers/:userId', getUserFollowers)

router.use(VerifyToken);

router.get("/", getUser);
router.put("/", editUser);
router.post("/:userId", followUser);

export default router;
