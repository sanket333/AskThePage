// backend/src/controllers.js

import { askVertexAI } from "./services.js";

export const handleAsk = async (req, res) => {
  // Expecting the frontend to send an object with context and question
  const { question } = req.body;

  // Basic validation to ensure we have what we need
  if (!question) {
    return res.status(400).json({ error: "Question is required." });
  }

  try {
    const answer = await askVertexAI({ question });
    console.log("Answer from Vertex AI:", answer);
    res.json({ answer });
  } catch (error) {
    console.error("Error occurred while asking Vertex AI:", error);
    res.status(500).json({ error: "Failed to get answer from Vertex AI" });
  }
};
