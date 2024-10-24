const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

app.use(cors());

app.get('/ques', async (req, res) => {
  try {
    const t = req.query.t;
    const apiUrl = `https://www.samirxpikachu.run.place/bing?message=${t}&mode=bing&uid=${uuidv4()}`;

    const response = await axios.get(apiUrl);

    res.json(response.data.answer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching data from the API' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
