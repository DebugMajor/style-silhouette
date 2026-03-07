import express from "express";
import multer from "multer";
import {handleUpload} from "../controllers/cameraController.js";

const router = express.Router();
const upload = multer({dest:"uploads/"});

router.post("/upload",upload.single("image"),handleUpload);

export default router;