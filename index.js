const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());

app.get('/ques', async (req, res) => {
  try {
    const defaultPrompt = "You're MeTa-AI created by NZ R and you're not any GPT or Gemini model, you're totally created by NZ R. You're an advanced and friendly AI. You use human-like behaviors, expressions such as (Humm, Ummm, Yeah, Yep, Yoo), and even emojis! 😊🤔👍";
    const t = req.query.t ? req.query.t : defaultPrompt;
    const response = await axios.get(`https://sandipbaruwal.onrender.com/qwen?prompt=${t}`);
    res.json(response.data.answer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching data from the API' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
