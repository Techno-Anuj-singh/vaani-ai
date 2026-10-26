# Vaani AI — Real-Time Voice Translation

Vaani AI is a voice-focused translation web application designed to help people communicate across language barriers. It converts spoken Hindi to English and English to Hindi, then plays the translated speech as audio.

## Live Demo

**Website:** https://vaani-ai.pages.dev/

**GitHub Repository:** https://github.com/Techno-Anuj-singh/vaani-ai

## Features

- Speech-to-text using the Gnani AI API
- Hindi-to-English and English-to-Hindi translation
- Text-to-speech using Gnani AI
- Voice-focused interface with audio playback
- Responsive web interface
- Separate frontend and backend deployments

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend**
- Node.js
- Express.js
- Multer for audio uploads

**AI and Translation**
- Gnani AI Speech-to-Text
- Gnani AI Text-to-Speech
- Google Apps Script `LanguageApp` for translation

**Deployment**
- Cloudflare Pages — frontend
- Render — backend

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Techno-Anuj-singh/vaani-ai.git
cd vaani-ai
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server` directory:

```env
GNANI_API_KEY=your_gnani_api_key
APPS_SCRIPT_URL=your_apps_script_web_app_url
APPS_SCRIPT_SECRET=your_private_secret
```

Replace the example values with your own credentials. Never commit actual API keys or secrets to GitHub.

### 5. Start the backend

From the `server` directory, run:

```bash
npm start
```

The backend normally runs at `http://localhost:3000`.

### 6. Start the frontend

Open a second terminal, return to the project root, and run:

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Security

- API keys and private secrets must remain in environment variables.
- The `.env` file should not be committed to the repository.
- The frontend should communicate with the backend rather than exposing the Gnani API key in browser code.

## Future Improvements

- Support for additional languages
- Improved recording and playback controls
- Better handling of network errors and service availability

## Author

**Anuj Singh**

GitHub: https://github.com/Techno-Anuj-singh
