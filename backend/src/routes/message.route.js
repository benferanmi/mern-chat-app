import express from "express"
import { getMessages, getUsersForSideBar, sendMessage } from "../controllers/message.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"
import upload from "../middleware/multer.js"

const router = express.Router()

router.get("/users", protectRoute, getUsersForSideBar)
router.get("/:id", protectRoute, getMessages)

router.post("/send/:id", upload.single('image'), protectRoute, sendMessage)

export default router