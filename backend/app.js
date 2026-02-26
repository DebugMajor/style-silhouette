const express = require("express");
const cors = require("cors");

const cameraRoutes = require("./routes/cameraRoutes");

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", cameraRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});