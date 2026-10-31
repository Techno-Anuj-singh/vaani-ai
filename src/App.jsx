
import { useRef, useState } from "react";
import {
  ArrowDown,
  AudioLines,
  Check,
  Headphones,
  Languages,
  Mic,
  ShieldCheck,
  Sparkles,
  Volume2,
  Waves,
} from "lucide-react";
import "./App.css";
import "./App-polish-overrides.css";

const API_BASE = "https://vaani-ai-backend-tj8p.onrender.com";
function audioBufferToWav(buffer) {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const dataSize = samples * blockAlign;

  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset, value) {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;

  for (let i = 0; i < samples; i++) {
    for (let channel = 0; channel < channels; channel++) {
      let sample = buffer.getChannelData(channel)[i];
      sample = Math.max(-1, Math.min(1, sample));

      const pcm = sample < 0
        ? sample * 0x8000
        : sample * 0x7fff;

      view.setInt16(offset, pcm, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [direction, setDirection] = useState("hi-en");
  const [status, setStatus] = useState(
    direction === "hi-en"
      ? "बात करने के लिए तैयार"
      : "Ready when you are"
  );

  const isHindiToEnglish = direction === "hi-en";

  const sourceLanguage = isHindiToEnglish ? "hi-IN" : "en-IN";
  const targetLanguage = isHindiToEnglish ? "en-IN" : "hi-IN";
  const ui = isHindiToEnglish
  ? {
      voiceTranslation: "आवाज़ अनुवाद",
      eyebrow: "आपकी आवाज़, बिना सीमाओं के",
      titleFirst: "दो भाषाएँ।",
      titleSecond: "एक बातचीत।",
      intro: "अपनी भाषा में बोलें। आपकी बात दूसरी भाषा में सुनें।",
      live: "लाइव अनुवादक",
      secure: "आवाज़ पर आधारित अनुभव",
      sourceCaption: "आप बोलते हैं",
      targetCaption: "आप सुनते हैं",
      sourceName: "हिंदी",
      sourceDetail: "हिन्दी",
      targetName: "अंग्रेज़ी",
      targetDetail: "English · India",
      listening: "सुन रहा हूँ",
      speaking: "अनुवाद सुनिए",
      processing: "आपकी बात का अनुवाद हो रहा है",
      ready: "बात शुरू करें",
      readyStatus: "बात करने के लिए तैयार",
      listeningStatus: "ध्यान से सुन रहा हूँ… रुकने के लिए टैप करें",
      preparing: "आपकी आवाज़ तैयार की जा रही है…",
      unsupported: "इस ब्राउज़र में रिकॉर्डिंग उपलब्ध नहीं है।",
      noAudio: "आवाज़ रिकॉर्ड नहीं हुई। फिर से कोशिश करें।",
      recordingFailed: "रिकॉर्डिंग विफल हुई। फिर से कोशिश करें।",
      microphone: "कृपया ब्राउज़र में माइक्रोफ़ोन की अनुमति दें।",
      tapSpeak: "बोलने के लिए टैप करें",
      stop: "रिकॉर्डिंग रोकें",
      translating: "अनुवाद हो रहा है…",
      finish: "अपनी बात पूरी करके रोकने के लिए टैप करें",
      wait: "इसमें कुछ पल लग सकते हैं",
      speakNaturally: "स्वाभाविक रूप से बोलें",
      speakDetail: "हिंदी में, अपने अंदाज़ में",
      translate: "हम अनुवाद करते हैं",
      translateDetail: "पर्दे के पीछे",
      hear: "अंग्रेज़ी सुनें",
      hearDetail: "आवाज़ में अनुवाद",
      noText: "स्क्रीन पर कोई टेक्स्ट नहीं",
      audioTranslation: "आवाज़ में अनुवाद",
      privacy: "आपकी बातचीत आवाज़ पर आधारित है। अनुवाद स्क्रीन पर नहीं दिखाए जाते।",
      footer: "उन बातचीतों के लिए जो मायने रखती हैं।",
      languages: "हिंदी ↔ अंग्रेज़ी",
    }
  : {
      voiceTranslation: "Voice translation",
      eyebrow: "YOUR VOICE, WITHOUT BORDERS",
      titleFirst: "Two languages.",
      titleSecond: "One conversation.",
      intro: "Speak naturally. Hear your words come alive in another language.",
      live: "LIVE TRANSLATOR",
      secure: "Voice-first experience",
      sourceCaption: "YOU SPEAK",
      targetCaption: "YOU HEAR",
      sourceName: "English",
      sourceDetail: "English · India",
      targetName: "Hindi",
      targetDetail: "हिन्दी",
      listening: "I'm listening",
      speaking: "Listen to your translation",
      processing: "Your words are on their way",
      ready: "Let's make ourselves understood",
      readyStatus: "Ready when you are",
      listeningStatus: "Listening carefully… tap stop when finished",
      preparing: "Preparing your voice…",
      unsupported: "Recording is not supported in this browser.",
      noAudio: "No audio captured. Please try again.",
      recordingFailed: "Recording failed. Please try again.",
      microphone: "Please allow microphone access in your browser.",
      tapSpeak: "Tap to speak",
      stop: "Stop recording",
      translating: "Translating…",
      finish: "Finish your sentence, then tap stop",
      wait: "This usually takes a few moments",
      speakNaturally: "Speak naturally",
      speakDetail: "In English, your way",
      translate: "We translate",
      translateDetail: "Behind the scenes",
      hear: "Hear Hindi",
      hearDetail: "Spoken out loud",
      noText: "No text shown on screen",
      audioTranslation: "Audio translation",
      privacy: "Your experience stays voice-first. Transcripts and translations stay off the screen.",
      footer: "Made for conversations that matter.",
      languages: "ENGLISH ↔ HINDI",
    };

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  
async function speakTranslation(text) {
  const response = await fetch(`${API_BASE}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      language: targetLanguage,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error || "Could not generate translated speech."
    );
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  setStatus(
    isHindiToEnglish
      ? "आपका अंग्रेज़ी अनुवाद सुनाया जा रहा है"
      : "Your Hindi translation is being spoken"
  );

  try {
    await new Promise((resolve, reject) => {
      audio.onended = resolve;
      audio.onerror = () =>
        reject(new Error("Unable to play the generated audio."));
      audio.play().catch(reject);
    });
  } finally {
    URL.revokeObjectURL(audioUrl);
  }
}

async function processRecording(recordedBlob) {
  setIsProcessing(true);

  try {
    setStatus(ui.preparing);

    const audioContext = new AudioContext();
    let wavBlob;

    try {
      const audioData = await recordedBlob.arrayBuffer();
      const decodedAudio = await audioContext.decodeAudioData(audioData);
      wavBlob = audioBufferToWav(decodedAudio);
    } finally {
      await audioContext.close();
    }

    // Step 1: Recognize speech in the selected source language.
    setStatus(
      isHindiToEnglish
        ? "आपकी हिंदी समझी जा रही है…"
        : "Understanding your English…"
    );

    const formData = new FormData();
    formData.append("audio", wavBlob, "recording.wav");
    formData.append("languageCode", sourceLanguage);

    const sttResponse = await fetch(`${API_BASE}/api/stt`, {
      method: "POST",
      body: formData,
    });

    const sttData = await sttResponse.json();

    if (!sttResponse.ok) {
      throw new Error(
        sttData.error ||
          (isHindiToEnglish
            ? "Speech recognition failed."
            : "आवाज़ पहचानने में समस्या हुई।")
      );
    }

    const recognizedText = sttData.transcript;

    if (!recognizedText || !recognizedText.trim()) {
      throw new Error(
        isHindiToEnglish
          ? "No speech was recognized. Please try again."
          : "आवाज़ समझ नहीं आई। कृपया फिर से कोशिश करें।"
      );
    }

    // Step 2: Translate in the selected direction.
    setStatus(
      isHindiToEnglish
        ? "आपके संदेश का अंग्रेज़ी में अनुवाद हो रहा है…"
        : "Translating your message into Hindi…"
    );

    const translationResponse = await fetch(
      `${API_BASE}/api/translate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: recognizedText,
          sourceLanguage,
          targetLanguage,
        }),
      }
    );

    const translationData = await translationResponse.json();

    if (!translationResponse.ok) {
      throw new Error(
        translationData.error ||
          (isHindiToEnglish
            ? "Translation failed."
            : "अनुवाद नहीं हो पाया।")
      );
    }

    const translatedText = translationData.translatedText;

    if (!translatedText || !translatedText.trim()) {
      throw new Error(
        isHindiToEnglish
          ? "No English translation was returned."
          : "हिंदी अनुवाद नहीं मिला।"
      );
    }

    // Step 3: Speak the translated result.
    await speakTranslation(translatedText);

    setStatus(
      isHindiToEnglish
        ? "हो गया! अब आप फिर से बात कर सकते हैं।"
        : "All done! Ready for another conversation."
    );
  } catch (error) {
    console.error("Voice translation error:", error);

    setStatus(
      error.message ||
        (isHindiToEnglish
          ? "Something went wrong. Please try again."
          : "कुछ गड़बड़ हुई। कृपया फिर से कोशिश करें।")
    );
  } finally {
    setIsProcessing(false);
  }
}


  async function startListening() {
    if (
      !navigator.mediaDevices?.getUserMedia ||
      !window.MediaRecorder
    ) {
      setStatus(ui.unsupported);
      return;
    }

    let stream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported(
        "audio/webm;codecs=opus"
      )
        ? "audio/webm;codecs=opus"
        : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());

        const recordedBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (!recordedBlob.size) {
          setStatus(ui.noAudio);
          return;
        }

        await processRecording(recordedBlob);
      };

      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        setStatus(ui.recordingFailed);
      };

      recorder.start();
      setIsRecording(true);
      setStatus(ui.listeningStatus);
    } catch (error) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      console.error("Microphone error:", error);
      setStatus(ui.microphone);
    }
  }

  function stopListening() {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      setStatus(ui.preparing);
      recorder.stop();
    }
  }

  const isSpeaking = 
  status.toLowerCase().includes("speaking") ||
  status.includes("सुनाया जा रहा है");
  const orbMode = isRecording
    ? "listening"
    : isSpeaking
      ? "speaking"
      : isProcessing
        ? "processing"
        : "idle";

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="#home" aria-label="Vaani AI home">
          <span className="brand-mark">
            <AudioLines size={23} strokeWidth={2.1} />
          </span>
          <span className="brand-copy">
            <strong>vaani<span>.</span></strong>
            <small>VOICE, UNDERSTOOD.</small>
          </span>
        </a>

        <div className="topbar-right">
          <span className="availability-dot" />
          <span>{ui.voiceTranslation}</span>
        </div>
      </header>

      <section className="workspace" id="home">
        <div className="intro">
          <div className="eyebrow">
            <Sparkles size={14} />
            <span>{ui.eyebrow}</span>
          </div>

          <h1>
               {ui.titleFirst}
               <br />
               <span>{ui.titleSecond}</span>
          </h1> 

          <p>{ui.intro}</p>

        </div>

        <section className="translator-card" aria-label="Voice translator">
          <div className="card-topline">
            <span className="live-label">
              <span className="availability-dot" />
              {ui.live}
            </span>
            <span className="secure-label">
              <ShieldCheck size={14} />
              {ui.secure}
            </span>
          </div>
          <button
           type="button"
            className="direction-switch"
             onClick={() => {
              if (isRecording || isProcessing) return;

              setDirection((current) =>
               current === "hi-en" ? "en-hi" : "hi-en"
              );

              setStatus(
                direction === "hi-en"
                  ? "Ready when you are"
                  : "बात करने के लिए तैयार"
              );
            }}
            disabled={isRecording || isProcessing}
          >
            <Languages size={17} />
            {isHindiToEnglish
               ? "अंग्रेज़ी में अनुवाद करें"
               : "Translate into Hindi"}
            <ArrowDown size={16} />
          </button>

          <div className="language-flow">
           <div className="language-block">
            <span className="language-caption">{ui.sourceCaption}</span>

            <div className="language-name">
             <span className="language-symbol hindi-symbol">
              {isHindiToEnglish ? "अ" : "A"}
             </span>

             <span>
               <strong>{ui.sourceName}</strong>
               <small>{ui.sourceDetail}</small>
              </span>
            </div>
          </div>

          <div className="flow-connector" aria-hidden="true">
            <span />
            <ArrowDown size={16} />
            <span />
              </div>

              <div className="language-block language-target">
               <span className="language-caption">{ui.targetCaption}</span>

               <div className="language-name">
                 <span className="language-symbol english-symbol">
                   <Volume2 size={22} />
                 </span>

                 <span>
                   <strong>{ui.targetName}</strong>
                   <small>{ui.targetDetail}</small>
                 </span>
               </div>
            </div>
          </div>

          <div className={`orb-stage orb-${orbMode}`}>
            <div className="orb-halo halo-one" />
            <div className="orb-halo halo-two" />
            <div className="orb-orbit orbit-one">
              <span />
            </div>
            <div className="orb-orbit orbit-two">
              <span />
            </div>
            <div className="orb-orbit orbit-three" />

            <div className="voice-orb">
              <div className="orb-shine" />
              <div className="orb-core">
                {isRecording ? (
                  <Mic size={31} strokeWidth={1.8} />
                ) : isSpeaking ? (
                  <Volume2 size={31} strokeWidth={1.8} />
                ) : isProcessing ? (
                  <Waves size={31} strokeWidth={1.8} />
                ) : (
                  <AudioLines size={31} strokeWidth={1.8} />
                )}
              </div>
            </div>

            <div className="orb-floor" />
          </div>

          <div className="interaction-copy" aria-live="polite">
            <span className={`state-indicator state-${orbMode}`}>
              <span />
              {isRecording
                ? ui.listening
                 : isSpeaking
                  ? ui.speaking
                   : isProcessing
                    ? ui.processing
                     : ui.readyStatus}
            </span>

            <h2>
              {isRecording
                ? ui.listening
                : isSpeaking
                  ? ui.speaking
                  : isProcessing
                    ? ui.processing
                    : ui.ready}
            </h2>

            <p className="status-message">{status}</p>
          </div>

          <div className="mic-action-area">
            <button
              className={`mic-button ${isRecording ? "button-recording" : ""}`}
              onClick={isRecording ? stopListening : startListening}
              disabled={isProcessing}
              type="button"
            >
              {isProcessing ? (
                <span className="button-spinner" />
              ) : isRecording ? (
                <span className="stop-square" />
              ) : (
                <Mic size={20} />
              )}

              <span>
                {isProcessing
                  ? ui.translating
                  : isRecording
                    ? ui.stop
                    : ui.tapSpeak}
              </span>

              {!isRecording && !isProcessing && (
                <span className="button-shortcut">
                  <ArrowDown size={15} />
                </span>
              )}
            </button>

            <p className="mic-hint">
              {isRecording
                ? ui.finish
                : isProcessing
                  ? ui.wait
                   : isHindiToEnglish
                    ? "हिंदी में बोलें · पूरा होने पर रोकें"
                     : "Speak in English · Tap stop when you're done"}
            </p>
          </div>

          <div className="card-footer">
            <span>
              <Check size={14} />
              {ui.noText}
            </span>
            <span>
              <Headphones size={14} />
              {ui.audioTranslation}
            </span>
          </div>
        </section>

        <div className="steps-strip">
          <div className="step-item">
            <span className="step-icon"><Mic size={17} /></span>
            <span>
              <strong>{ui.speakNaturally}</strong>
              <small>{ui.speakDetail}</small>
            </span>
          </div>

          <div className="step-divider" />

          <div className="step-item">
            <span className="step-icon"><Languages size={17} /></span>
            <span>
              <strong>{ui.translate}</strong>
              <small>{ui.translateDetail}</small>
            </span>
          </div>

          <div className="step-divider" />

          <div className="step-item">
            <span className="step-icon"><Volume2 size={17} /></span>
            <span>
              <strong>{ui.hear}</strong>
              <small>{ui.hearDetail}</small>
            </span>
          </div>
        </div>

        <p className="privacy-line">
          <ShieldCheck size={14} />
          <span><span>{ui.privacy}</span></span>
        </p>
      </section>

      <footer className="site-footer">
        <span className="footer-brand">vaani by Anuj Singh<span>.</span></span>
        <span>{ui.footer}</span>
        <span className="footer-version">{ui.languages}</span>
      </footer>
    </main>
  );
}
