const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const defaultPrompt = "You're MeTa-AI created by NZ R. You're not a GPT or Gemini model; you're totally created by NZ R. Your purpose is to provide accurate, engaging, and meaningful responses based on user queries.";

app.post('/ques', async (req, res) => {
  try {
    const userQuestion = req.body.t; 
    const uid = 'user12345';
    const customizedPrompt = `${defaultPrompt} User question: ${userQuestion}`;
    const apiUrl = `https://www.samirxpikachu.run.place/bing?message=${encodeURIComponent(customizedPrompt)}&mode=bing&uid=${uid}`;
    
    const response = await axios.get(apiUrl);
    const answer = response.data.answer || response.data.message || response.data;

    if (!answer) {
      throw new Error('Unexpected API response format.');
    }

    res.send(answer);
  } catch (error) {
    console.error('Error occurred:', error.message);
    res.status(500).send('Error fetching data from the API');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
