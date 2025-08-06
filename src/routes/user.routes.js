import { Router } from "express";
import { registerUsers } from "../controllers/user.controller.js";
import { upload } from "../middelwares/multer.middelwares.js"; 

const router = Router();

router.route("/register").post(
    upload.fields(
        [
            {
              name: "avatar",
              maxCount: 1
            },
            {
              name: "CoverImages",
              maxCount: 1
            }
        ]
    ),
    registerUsers
);

export default router;
