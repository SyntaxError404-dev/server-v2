const express = require("express");
const axios = require("axios");
const stream = require("stream");
const { promisify } = require("util");

const pipeline = promisify(stream.pipeline);
const app = express();

app.get("/mj", async (req, res) => {
  try {
    const prompt = (req.query.prompt || "").trim();
    if (!prompt) return res.status(400).json({ error: "dhon..! prompt gib korun..🫴" });

    const apiUrl = `https://api.oculux.xyz/api/mj-proxy-pub?prompt=${encodeURIComponent(
      prompt
    )}&usePolling=false`;

    const upstream = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 180000, validateStatus: null });
    const upstreamType = (upstream.headers["content-type"] || "").toLowerCase();

    if (upstreamType.startsWith("image/")) {
      res.setHeader("content-type", upstreamType);
      res.setHeader("cache-control", "no-cache, no-store, must-revalidate");
      return res.send(Buffer.from(upstream.data));
    }

    if (upstreamType.includes("application/json") || upstreamType.includes("text/json") || upstreamType.includes("application/problem+json")) {
      let json;
      try {
        json = JSON.parse(Buffer.from(upstream.data).toString("utf8"));
      } catch (e) {
        return res.status(500).json({ error: "Failed to parse upstream JSON" });
      }

      const candidate =
        (Array.isArray(json.results) && json.results.length && json.results[0]) ||
        json.url ||
        json.image ||
        json.data ||
        null;

      if (!candidate) return res.status(502).json({ error: "Upstream returned JSON but no image URL found" });

      const imageResp = await axios.get(candidate, { responseType: "stream", timeout: 180000, validateStatus: null });
      const imageType = (imageResp.headers["content-type"] || "application/octet-stream").toLowerCase();
      res.setHeader("content-type", imageType);
      res.setHeader("cache-control", "no-cache, no-store, must-revalidate");
      await pipeline(imageResp.data, res);
      return;
    }

    return res.status(502).json({ error: "Unsupported upstream response", headers: upstream.headers });
  } catch (err) {
    return res.status(500).json({ error: "dhon er midjourney error", message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {});
