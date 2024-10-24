const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

app.use(cors());

const generateUid = () => uuidv4();

app.get('/ques', async (req, res) => {
  try {
    const t = req.query.t;
    const uid = generateUid();

    const apiUrl = `https://www.samirxpikachu.run.place/bing?message=${t}&mode=bing&uid=${uid}`;
    console.log(`Calling API: ${apiUrl}`);  // Log the API URL

    const response = await axios.get(apiUrl);

    // Log the response data for debugging
    console.log('API Response Data:', response.data);

    // Check if the expected structure of the response has a 'message' or other key
    const message = response.data.message || response.data.answer || response.data; 

    // If message is undefined, provide a fallback error message
    if (!message) {
      throw new Error('Unexpected API response format.');
    }

    res.json({
      uid: uid,
      answer: message, // Return the message from the API response
    });
  } catch (error) {
    console.error('Error occurred:', error.message);
    res.status(500).json({ error: 'Error fetching data from the API' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
