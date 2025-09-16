const express = require("express");
const axios = require("axios");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.get("/gen", async (req, res) => {
  const prompt = req.query.prompt;
  if (!prompt) return res.status(400).send("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀dhon..! prompt gib korun..🫴");

  try {
    const apiUrl = `https://api.oculux.xyz/api/mj-proxy-pub?prompt=${encodeURIComponent(prompt)}&usePolling=false`;
    const response = await axios.get(apiUrl, { timeout: 180000 });
    const urls = response.data.results;
    if (!urls || urls.length !== 4) return res.status(500).send("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀dhon error..ahh..");

    const buffers = [];
    for (let i = 0; i < 4; i++) {
      const imageResp = await axios.get(urls[i], { responseType: "arraybuffer" });
      buffers.push(Buffer.from(imageResp.data));
    }

    const metadata = await Promise.all(buffers.map(buf => sharp(buf).metadata()));
    const width = metadata[0].width;
    const height = metadata[0].height;

    const combined = await sharp({
      create: {
        width: width * 2,
        height: height * 2,
        channels: 3,
        background: { r: 0, g: 0, b: 0 }
      }
    })
      .composite([
        { input: buffers[0], left: 0, top: 0 },
        { input: buffers[1], left: width, top: 0 },
        { input: buffers[2], left: 0, top: height },
        { input: buffers[3], left: width, top: height }
      ])
      .png()
      .toBuffer();

    res.setHeader("Content-Type", "image/png");
    res.send(combined);

  } catch (e) {
    res.status(500).send("ahhhhh..abr cde gelam..");
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
