const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const app = express();
const port = process.env.PORT || 3000;
const imagesDir = path.join(__dirname, 'images');

if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

const cleanupFiles = async (files) => {
  for (const file of files) {
    try {
      if (fs.existsSync(file)) await fs.promises.unlink(file);
    } catch (e) {
      console.error(e);
    }
  }
};

const autoCleanupFolder = async () => {
  try {
    if (!fs.existsSync(imagesDir)) return;
    const now = Date.now();
    for (const f of fs.readdirSync(imagesDir)) {
      const file = path.join(imagesDir, f);
      if (now - fs.statSync(file).mtime.getTime() > 30 * 60 * 1000) await fs.promises.unlink(file);
    }
  } catch (e) {
    console.error(e);
  }
};

app.get('/mj', async (req, res) => {
  const tempFiles = [];
  await autoCleanupFolder();

  const prompt = req.query.prompt;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiUrl = `https://api.oculux.xyz/api/mj-proxy-pub?prompt=${encodeURIComponent(prompt)}&usePolling=false`;

  try {
    const response = await axios.get(apiUrl, { timeout: 180000 });
    const urls = response.data.results;

    if (!urls || urls.length === 0) {
      return res.status(500).json({ error: 'API failed to generate images' });
    }

    const buffers = [];
    for (let i = 0; i < urls.length; i++) {
      const res = await axios.get(urls[i], { responseType: 'arraybuffer' });
      const filePath = path.join(imagesDir, `mj_${i + 1}_${Date.now()}.png`);
      fs.writeFileSync(filePath, res.data);
      tempFiles.push(filePath);
      buffers.push(Buffer.from(res.data));
    }

    const dims = await Promise.all(buffers.map((b) => sharp(b).metadata()));
    const gridWidth = dims[0].width * 2;
    const gridHeight = dims[0].height * 2;
    const cellWidth = dims[0].width;
    const cellHeight = dims[0].height;

    const gridBuffer = await sharp({
      create: {
        width: gridWidth,
        height: gridHeight,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    })
      .composite(
        buffers.map((input, i) => ({
          input,
          left: (i % 2) * cellWidth,
          top: Math.floor(i / 2) * cellHeight,
        }))
      )
      .png()
      .toBuffer();

    const gridPath = path.join(imagesDir, `grid_${Date.now()}.png`);
    fs.writeFileSync(gridPath, gridBuffer);
    tempFiles.push(gridPath);

    res.set('Content-Type', 'image/png');
    res.send(gridBuffer);

    setTimeout(() => cleanupFiles(tempFiles), 30 * 60 * 1000);
  } catch (e) {
    setTimeout(() => cleanupFiles(tempFiles), 30 * 60 * 1000);
    res.status(500).json({ error: 'An error occurred while generating images' });
  }
});

app.get('/mj/select/:index', async (req, res) => {
  const index = parseInt(req.params.index);
  const files = fs.readdirSync(imagesDir).filter(f => f.startsWith('mj_') && f.endsWith('.png'));

  if (isNaN(index) || index < 1 || index > files.length) {
    return res.status(400).json({ error: 'Invalid selection. Choose a number between 1 and 4' });
  }

  const selectedFile = files[index - 1];
  const filePath = path.join(imagesDir, selectedFile);
  const finalPath = path.join(imagesDir, `final_${Date.now()}.png`);

  try {
    fs.copyFileSync(filePath, finalPath);
    res.set('Content-Type', 'image/png');
    res.sendFile(finalPath, (err) => {
      if (!err) {
        setTimeout(() => cleanupFiles([finalPath]), 30 * 60 * 1000);
      }
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send the selected image' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
