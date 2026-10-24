
const fs = require("fs");

async function testTTS() {
  const response = await fetch("http://localhost:3000/api/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: "नमस्ते, आप कैसे हैं?",
      language: "hi-IN",
    }),
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok || !contentType.includes("audio")) {
    console.log("HTTP status:", response.status);
    console.log("Content-Type:", contentType);
    console.log("Response:", await response.text());
    return;
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());

  fs.writeFileSync("test-tts.wav", audioBuffer);

  console.log("HTTP status:", response.status);
  console.log("Content-Type:", contentType);
  console.log("Audio saved: test-tts.wav");
  console.log("Bytes:", audioBuffer.length);
}

testTTS().catch(console.error);
