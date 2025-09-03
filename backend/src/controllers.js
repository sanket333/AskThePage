// backend/src/controllers.js


import { askVertexAI } from "./services.js";

export const handleAsk = async (req, res) => {
  // Only expect question from frontend
  const { question } = req.body;

  // Get stored page context from app.locals
  const page_content = req.app.locals.pageContext ? req.app.locals.pageContext() : "";

  if (!question) {
    return res.status(400).json({ error: "Question is required." });
  }
  if (!page_content) {
    return res.status(400).json({ error: "Page context not initialized. Please reload the page." });
  }

  try {
    const answer = await askVertexAI({ question, page_content });
    console.log("Answer from Vertex AI:", answer);
    res.json({ answer });
  } catch (error) {
    console.error("Error occurred while asking Vertex AI:", error);
    res.status(500).json({ error: "Failed to get answer from Vertex AI" });
  }
};