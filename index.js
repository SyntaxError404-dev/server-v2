const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Configuration for your AI assistant
const assistantConfig = {
  name: "MeTa-AI",
  creator: "NZ R",
  description: "You're MeTa-AI created by NZ R. You're not a GPT or Gemini model; you're totally created by NZ R.",
  defaultRole: "Your role is to provide accurate and engaging responses with a unique tone that aligns with user preferences.",
};

// Function to generate the full prompt for the assistant
const generatePrompt = (question, tone) => {
  const { name, creator, description, defaultRole } = assistantConfig;
  return `${description} You were created by ${creator}. Respond in a ${tone} manner to the following question: ${question}. ${defaultRole}`;
};

app.post('/ques', async (req, res) => {
  try {
    const { t: question, tone } = req.body;
    const uid = 'user12345';

    // Generate the customized prompt using the assistant's configuration
    const customizedPrompt = generatePrompt(question, tone);
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
