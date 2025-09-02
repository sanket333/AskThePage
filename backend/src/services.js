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
    parts: [{"text": `You are an assistant. Answer the User's questions based ONLY on the page content provided and conversation history."`}]
  },
};


// Gemini 2.5 Flash token limit
const TOKEN_LIMIT = 1048576;

// Estimate tokens (1 token ≈ 4 characters for English)
function estimateTokens(str) {
  return Math.ceil(str.length / 4);
}

// Main function with chat history and chunking
export const askVertexAI = async ({ question, page_content, history = [] }) => {
  // Prepare chat history (each item: {role, text})
  let messages = [...history];

  // Chunk page_content if too large
  let contextChunks = [];
  if (estimateTokens(page_content) > TOKEN_LIMIT / 2) {
    // Split into chunks of TOKEN_LIMIT/2 tokens
    let chunkSize = Math.floor((TOKEN_LIMIT / 2) * 4); // chars
    for (let i = 0; i < page_content.length; i += chunkSize) {
      contextChunks.push(page_content.slice(i, i + chunkSize));
    }
  } else {
    contextChunks = [page_content];
  }

  let finalAnswer = '';
  for (let idx = 0; idx < contextChunks.length; idx++) {
    const context = contextChunks[idx];
    // Add context and question to messages
    messages.push({ text: `Context: ${context}\nQuestion: ${question}` });
    const chat = ai.chats.create({
      model: model,
      config: generationConfig
    });
    try {
      const response = await chat.sendMessageStream({ message: messages });
      let answer = '';
      for await (const chunk of response) {
        if (chunk.text) {
          answer += chunk.text;
        }
      }
      finalAnswer += answer + '\n';
      // Add model response to history for next chunk
      messages.push({ text: answer });
    } catch (error) {
      console.error('Error occurred while asking Vertex AI:', error);
      throw error;
    }
  }
  return finalAnswer.trim();
};