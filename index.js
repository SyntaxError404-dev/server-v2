const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());

app.get('/ques', async (req, res) => {
  try {
    const t = req.query.t;
    const response = await axios.get(`https://www.samirxpikachu.run.place/multi/Ml?prompt=${t}&model=MythoMax-L2-13b`);

    res.json(response.data.message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching data from the API' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
