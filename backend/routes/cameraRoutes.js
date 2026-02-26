const express = require("express");
const multer = require("multer");
const controller = require("../controllers/cameraController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("image"), controller.handleUpload);

module.exports = router;