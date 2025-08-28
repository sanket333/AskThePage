import express from "express";
import { handleAsk } from "./controllers.js";

const router = express.Router();

router.post("/ask", handleAsk);
router.get("/", (req, res) => {
  res.send("API is running");
});

export default router;
