import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css'
function App() {
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  
  const startListening = () => {
    setListening(true);
    setResult('');
    setError('');
    
    const recognition = new window.webkitSpeechRecognition(); // Create a recognition instance
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.log('Listening...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('You said:', transcript);
      setResult('You said: ' + transcript);
      setError('');
      recognition.stop();

      // Send the captured audio to the Flask server
      const formData = new FormData();
      formData.append('audio', transcript);

      axios.post('http://localhost:5000/recognize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(response => {
          setListening(false);
          setResult(response.data.result);
          setError('');
        })
        .catch(error => {
          setListening(false);
          setError('Error: ' + error.response.data.error);
        });
    };

    recognition.onerror = (event) => {
      setError('Error occurred while listening: ' + event.error);
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
    <>
    <style>
      
    </style>
    <div className="min-h-screen bg-blue-300 flex flex-col justify-center items-center">
      <h1 className="text-4xl mb-4">
        Speech Recognition
        {listening && (
          <span className="ml-2">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </span>
        )}
      </h1>
      <button
        onClick={startListening}
        disabled={listening}
        className={`py-2 px-4 rounded ${
          listening
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-700 text-white'
        }`}
      >
        {listening ? 'Listening...' : 'Start Listening'}
      </button>
      <button
        onClick={stopListening}
        disabled={!listening}
        className={`mt-4 py-2 px-4 rounded ${
          !listening
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
            : 'bg-red-500 hover:bg-red-700 text-white'
        }`}
      >
        Stop Listening
      </button>
      <p className="mt-4 text-xl">{result}</p>
      <p className="mt-4 text-red-500">{error}</p>
    </div>
    </>
  );
}

export default App;
