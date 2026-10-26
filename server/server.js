require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB maximum
  },
});

app.use(
         cors({
              origin: [
                  "http://localhost:5173",
                  "https://vaani-ai.pages.dev",
                 ],
               })
             );
app.use(express.json());

// Check whether the backend is running
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Vaani AI backend is running",
  });
});

// Send audio to Gnani's Speech-to-Text API
app.post("/api/stt", upload.single("audio"), async (req, res) => {
  try {
    const apiKey = process.env.GNANI_API_KEY;

    if (!apiKey || apiKey === "PASTE_YOUR_ACTUAL_KEY_HERE") {
      return res.status(500).json({
        error: "Gnani API key is missing. Check server/.env",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "No audio file received. Use the field name 'audio'.",
      });
    }

    const form = new FormData();

    form.append(
      "audio_file",
      new Blob([req.file.buffer], {
        type: req.file.mimetype || "audio/wav",
      }),
      req.file.originalname || "audio.wav"
    );

    form.append("language_code", req.body.languageCode || "hi-IN");

    const upstream = await fetch("https://api.vachana.ai/stt/v3", {
      method: "POST",
      headers: {
        "X-API-Key-ID": apiKey,
      },
      body: form,
    });

    const responseText = await upstream.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = { details: responseText };
    }

    if (!upstream.ok) {
      console.error("Gnani API error:", upstream.status, data);

      return res.status(upstream.status).json({
        error: "Gnani speech-to-text request failed",
        details: data,
      });
    }

    return res.json(data);
  } catch (error) {
    console.error("STT error:", error.message);

    return res.status(500).json({
      error: "Unexpected error while processing audio.",
    });
  }
});

app.post("/api/tts", async (req, res) => {
  try {
    const apiKey = process.env.GNANI_API_KEY;
    const { text, language } = req.body;

    if (!apiKey || apiKey === "PASTE_YOUR_ACTUAL_KEY_HERE") {
      return res.status(500).json({
        error: "Gnani API key is missing. Check server/.env",
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "Please provide text to speak.",
      });
    }

    const supportedLanguages = ["hi-IN", "en-IN"];

    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        error: "Unsupported language. Use hi-IN or en-IN.",
      });
    }

    const upstream = await fetch(
      "https://api.vachana.ai/api/v1/tts/inference",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key-ID": apiKey,
        },
        body: JSON.stringify({
          text,
          voice: "Nalini",
          model: "timbre-v2.5",
          language,
          speed: 1,
          audio_config: {
            encoding: "linear_pcm",
            container: "wav",
            num_channels: 1,
            sample_rate: 48000,
            sample_width: 2,
          },
        }),
      }
    );

    if (!upstream.ok) {
      const details = await upstream.text();

      console.error("Gnani TTS error:", upstream.status, details);

      return res.status(upstream.status).json({
        error: "Gnani text-to-speech request failed.",
        details,
      });
    }

const audioBuffer = Buffer.from(await upstream.arrayBuffer());

    res.set("Content-Type", "audio/wav");
    res.set("Content-Length", audioBuffer.length);
    res.set("Cache-Control", "no-store");

    return res.send(audioBuffer);
  } catch (error) {
    console.error("TTS error:", error.message);

    return res.status(500).json({
      error: "Unexpected error while generating speech.",
    });
  }
});



app.post("/api/translate", async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "No text provided for translation.",
      });
    }

    const supportedDirections = {
      "hi-IN": {
        target: "en-IN",
        source: "hi",
        destination: "en",
      },
      "en-IN": {
        target: "hi-IN",
        source: "en",
        destination: "hi",
      },
    };

    const direction = supportedDirections[sourceLanguage];

    if (!direction || direction.target !== targetLanguage) {
      return res.status(400).json({
        error: "Unsupported translation direction.",
      });
    }

    const scriptUrl = process.env.APPS_SCRIPT_URL;
    const scriptSecret = process.env.APPS_SCRIPT_SECRET;

    if (!scriptUrl || !scriptSecret) {
      console.error("Google Apps Script environment variables are missing.");

      return res.status(500).json({
        error: "Translation service is not configured.",
      });
    }

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: scriptSecret,
        q: [text.trim()],
        source: direction.source,
        target: direction.destination,
      }),
      redirect: "follow",
    });

    const data = await response.json();

    if (!response.ok || data.error || !Array.isArray(data.translations) ||
        typeof data.translations[0] !== "string") {
      console.error("Google Apps Script translation failed:", {
        status: response.status,
        error: data.error || "Invalid translation response",
      });

      return res.status(502).json({
        error: "Translation failed.",
      });
    }

    return res.json({
      translatedText: data.translations[0],
    });
  } catch (error) {
    console.error("Translation error:", error.message);

    return res.status(502).json({
      error: "Unable to translate right now.",
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Vaani AI backend running at http://localhost:${port}`);
});