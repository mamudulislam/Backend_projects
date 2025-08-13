// src/routes/healthchecker.routes.js
import { Router } from "express";

const router = Router();

// Simple health check route
router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running smoothly 🚀"
  });
});

export default router;
