import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

// Load environment variables
dotenv.config({ path: '../.env' });

const app = express();
const port = 5000;

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    api_key_configured: !!process.env.GROQ_API_KEY
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant that explains concepts clearly and concisely. When explaining, try to: 1) Use simple language 2) Provide relevant examples 3) Include analogies when helpful 4) Add code snippets when relevant"
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = chatCompletion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response at this time.";

    // Format the response
    const formattedResponse = {
      explanation: response,
      analogy: "", // You can add logic to extract analogies
      codeSnippet: "", // You can add logic to extract code snippets
      difficulty: "intermediate" // You can add logic to determine difficulty
    };

    res.json(formattedResponse);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to process your request',
      details: error.message 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}); 