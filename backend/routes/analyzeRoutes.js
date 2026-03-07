import express from "express"
import { analyzeOutfit } from "../controllers/analyzeController.js"

const router = express.Router()

router.post("/analyze-outfit", analyzeOutfit)

export default router