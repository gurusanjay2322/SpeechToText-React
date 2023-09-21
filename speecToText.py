from flask import Flask, request, jsonify
import speech_recognition as sr
import pyttsx3
from flask_cors import CORS 
app = Flask(__name__)
CORS(app)


r = sr.Recognizer()


engine = pyttsx3.init()



@app.route('/recognize', methods=['POST'])
def recognize_speech():
    try:
        audio_data = request.files['audio']
        with sr.AudioFile(audio_data) as source:
            r.adjust_for_ambient_noise(source, duration=0.2)
            audio = r.listen(source)
        text = r.recognize_google(audio)
        text = text.lower()
        print("You said:", text)
        speak_text("You said: " + text)
        return jsonify({"result": "You said: " + text})
    except sr.UnknownValueError:
        return jsonify({"error": "Google Speech Recognition could not understand audio"})
    except sr.RequestError as e:
        return jsonify({"error": f"Could not request results from Google Speech Recognition service; {e}"})

def speak_text(text):
    engine.say(text)
    engine.runAndWait()

if __name__ == '__main__':
    app.run(debug=True)
