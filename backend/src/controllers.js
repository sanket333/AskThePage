import { askOpenAi } from "./services.js";

export const handleAsk = async (req, res) => {
  const { question } = req.body;
  console.log(question);
  try {
    const answer = await askOpenAi(question);
    res.json({ answer });
  } catch (error) {
    console.error("Error occurred while asking OpenAI:", error);
    res.status(500).json({ error: "Failed to get answer from OpenAI" });
  }
};
