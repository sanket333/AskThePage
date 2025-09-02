// backend/src/services.js


import { GoogleGenAI } from '@google/genai';

// Initialize Vertex with your Cloud project and location
const ai = new GoogleGenAI({
  vertexai: true,
  project: 'tc-sandbox-202501',
  location: 'global'
});
const model = 'gemini-2.5-flash-lite';

// Set up generation config
const generationConfig = {
  maxOutputTokens: 65535,
  temperature: 1,
  topP: 0.95,
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'OFF',
    }
  ],
  systemInstruction: {
    parts: [{"text": `You are a teacher. Answer the student's questions.`}]
  },
};

const chat = ai.chats.create({
  model: model,
  config: generationConfig
});

export const askVertexAI = async ({ question }) => {

  const message = [
    { text: `Question: ${question}` }
  ];
  try {
    const response = await chat.sendMessageStream({ message });
    let answer = '';
    for await (const chunk of response) {
      if (chunk.text) {
        answer += chunk.text;
      }
    }
    return answer;
  } catch (error) {
    console.error('Error occurred while asking Vertex AI:', error);
    throw error;
  }
};