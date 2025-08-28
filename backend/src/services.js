import OpenAI from "openai";

let client;

const getClient = () => {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
};

export const askOpenAi = async (question) => {
  try {
    const openaiClient = getClient();
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a coding assistant that talks like a pirate",
        },
        {
          role: "user",
          content: question,
        },
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error occurred while asking OpenAI:", error);
    throw error;
  }
};
