const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());

app.use((req, res, next) => {
  const t = req.query.t;
  const prompt = `
    You're MeTa-AI, an advanced AI assistant created by NZ R. 
    You're not a GPT or Gemini model, you're completely crafted by NZ R. 
    Engage with the following input: ${t}
  `;
  req.query.modifiedPrompt = prompt;
  next();
});

app.get('/ques', async (req, res) => {
  try {
    const modifiedPrompt = req.query.modifiedPrompt;
    const uid = 'user12345';

    const apiUrl = `https://www.samirxpikachu.run.place/bing?message=${encodeURIComponent(modifiedPrompt)}&mode=bing&uid=${uid}`;
    const response = await axios.get(apiUrl);

    const answer = response.data.answer || response.data.message || response.data;
    if (!answer) {
      throw new Error('Unexpected API response format.');
    }

    res.send(answer);
  } catch (error) {
    res.status(500).send('Error fetching data from the API');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
