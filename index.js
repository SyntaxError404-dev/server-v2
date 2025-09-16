const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;
const baseDir = path.join(__dirname, "jobs");
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir);

app.get("/mj", async (req, res) => {
  const prompt = (req.query.prompt || "").trim();
  if (!prompt) return res.status(400).json({ error: "dhon..! prompt gib korun..🫴" });

  const jobId = uuidv4();
  const jobDir = path.join(baseDir, jobId);
  fs.mkdirSync(jobDir);

  const apiUrl = `https://api.oculux.xyz/api/mj-proxy-pub?prompt=${encodeURIComponent(prompt)}&usePolling=false`;
  try {
    const response = await axios.get(apiUrl, { timeout: 180000 });
    const urls = response.data.results;
    if (!urls || urls.length === 0) return res.status(500).json({ error: "No images generated" });

    const bufs = [];
    const paths = [];
    for (let i = 0; i < urls.length; i++) {
      const r = await axios.get(urls[i], { responseType: "arraybuffer" });
      const file = path.join(jobDir, `img${i + 1}.png`);
      fs.writeFileSync(file, r.data);
      bufs.push(Buffer.from(r.data));
      paths.push(file);
    }

    const dims = await sharp(bufs[0]).metadata();
    const gridWidth = dims.width * 2;
    const gridHeight = dims.height * 2;
    const cellWidth = dims.width;
    const cellHeight = dims.height;

    const gridBuf = await sharp({
      create: { width: gridWidth, height: gridHeight, channels: 3, background: { r: 0, g: 0, b: 0 } },
    })
      .composite(
        bufs.map((input, i) => ({
          input,
          left: (i % 2) * cellWidth,
          top: Math.floor(i / 2) * cellHeight,
        }))
      )
      .png()
      .toBuffer();

    const gridPath = path.join(jobDir, "grid.png");
    fs.writeFileSync(gridPath, gridBuf);

    res.json({ jobId, message: "Job created. Use /mj?id=" + jobId + " to fetch grid or /mj?getimg=1-4&id=" + jobId + " for individual." });
  } catch (e) {
    res.status(500).json({ error: "Failed to generate images" });
  }
});

app.get("/mj", async (req, res) => {
  const { id, getimg } = req.query;
  if (!id) return res.status(400).json({ error: "Missing job ID" });
  const jobDir = path.join(baseDir, id);
  if (!fs.existsSync(jobDir)) return res.status(404).json({ error: "Job not found" });

  if (!getimg) {
    const gridPath = path.join(jobDir, "grid.png");
    if (!fs.existsSync(gridPath)) return res.status(404).json({ error: "Grid not found" });
    return res.sendFile(gridPath);
  }

  const index = parseInt(getimg);
  if (isNaN(index) || index < 1 || index > 4) return res.status(400).json({ error: "Invalid image index" });
  const imgPath = path.join(jobDir, `img${index}.png`);
  if (!fs.existsSync(imgPath)) return res.status(404).json({ error: "Image not found" });
  return res.sendFile(imgPath);
});

app.listen(PORT, () => console.log(`MJ host running on ${PORT}`));
