const fs = require("fs");
const path = require("path");

async function testSTT() {
  const filePath =
    "C:\\Users\\lenovo\\Downloads\\WhatsApp Ptt 2026-10-24 at 10.40.48 AM.mp3";

  if (!fs.existsSync(filePath)) {
    console.error("Audio file not found:", filePath);
    return;
  }

  const form = new FormData();

  form.append("languageCode", "hi-IN");
  form.append(
    "audio",
    new Blob([fs.readFileSync(filePath)], { type: "audio/mpeg" }),
    path.basename(filePath)
  );

  try {
    const response = await fetch("http://localhost:3000/api/stt", {
      method: "POST",
      body: form,
    });

    const result = await response.text();

    console.log("HTTP status:", response.status);
    console.log("Response:", result);
  } catch (error) {
    console.error("Request failed:", error.message);
  }
}

testSTT();