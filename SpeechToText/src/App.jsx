import React, { useState, useRef } from "react";
import axios from "axios";
import "./App.css";
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';


function App() {
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const startListening = () => {
    setListening(true);
    setResult("");
    setError("");

    const recognition = new window.webkitSpeechRecognition(); // Create a recognition instance
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.log("Listening...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("You said:", transcript);
      setResult("You said: " + transcript);
      setError("");
      recognition.stop();

      // Send the captured audio to the Flask server
      const formData = new FormData();
      formData.append("audio", transcript);

      axios
        .post("http://localhost:5000/recognize", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          setListening(false);
          setResult(response.data.result);
          setError("");
        })
        .catch((error) => {
          setListening(false);
          setError("Error: " + error.response.data.error);
        });
    };

    recognition.onerror = (event) => {
      setError("Error occurred while listening: " + event.error);
      recognition.stop();
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-[url(https://c4.wallpaperflare.com/wallpaper/350/302/569/sound-waves-wallpaper-preview.jpg)]">
      <div className="w-full h-full bg-slate-700  bg-opacity-50">
        <div className="h-screen flex flex-col justify-center items-center text-opacity-100">
          <h1 className="font-kanit text-white text-7xl mb-4">
            Speech Recognition
            {listening && (
              <span className="ml-2">
                <span className="dot bg-white" />
                <span className="dot bg-white" />
                <span className="dot bg-white" />
              </span>
            )}
          </h1>
          <div className="flex flex-row just items-center space-x-4 ">
          <button
            onClick={startListening}
            disabled={listening}
            className={`py-2 px-4 rounded ${
              listening
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "border-collapse transition ease-in-out hover:scale-105 before:hover:ease-in-out bg-[#FF6969] hover:bg-[#C70039] text-white"
            }`}
          >
            {listening ? "Listening..." : "Start Listening"}
          </button>
          <button
            onClick={stopListening}
            disabled={!listening}
            className={`py-2 px-4 rounded ${
              !listening
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "border-collapse transition ease-in-out hover:scale-105 bg-[#12486B] hover:[#141E46] text-white"
            }`}
          >
            Stop Listening  
          </button>
          </div>
          <p className="mt-4 text-3xl text-white font-oswald">{result}</p>
          <p className="mt-4 text-red-500">{error}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
