import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
} from "../controllers/tweet.controller.js";

import { verify } from "../middelwares/auth.middelwares.js";

const router = Router();

router.post("/", verify, createTweet);
router.delete("/:tweetId", verify, deleteTweet);
router.get("/user/:userId", getUserTweets);

export default router;
