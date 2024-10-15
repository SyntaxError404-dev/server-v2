const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());

let userMemory = {};

app.get('/ques', async (req, res) => {
  try {
    const userId = req.query.userId || 'default_user';
    const t = req.query.t || '';

    if (!userMemory[userId]) {
      userMemory[userId] = [];
    }

    userMemory[userId].push(t);

    const conversationHistory = userMemory[userId].slice(-5).join(' ');

    const defaultPrompt = "You are MeTa-AI, created by NZ R, a unique AI built to communicate like a human. Your responses are concise, professional, and always carry depth. You use natural expressions like 'Humm,' 'Ummm,' and 'Yeah,' and you never overemphasize who your creator is unless explicitly asked. Respond with insightful, human-like messages.";

    const finalPrompt = `${defaultPrompt} ${conversationHistory}`;

    const response = await axios.get(`https://sandipbaruwal.onrender.com/qwen?prompt=${t || finalPrompt}`);
    
    res.json(response.data.answer);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data from the API' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
