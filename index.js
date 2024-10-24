const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());

app.get('/ques', async (req, res) => {
  try {
    const t = req.query.t;
    const uid = 'user12345';  // Static UID

    const apiUrl = `https://www.samirxpikachu.run.place/bing?message=${t}&mode=bing&uid=${uid}`;
    console.log(`Calling API: ${apiUrl}`);

    const response = await axios.get(apiUrl);

    console.log('API Response Data:', response.data);

    // Extract the answer from the API response
    const answer = response.data.answer || response.data.message || response.data;

    if (!answer) {
      throw new Error('Unexpected API response format.');
    }

    // Send only the answer as a response, without any extra data
    res.send(answer);
  } catch (error) {
    console.error('Error occurred:', error.message);
    res.status(500).send('Error fetching data from the API');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
