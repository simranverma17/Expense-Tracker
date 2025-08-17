export const startListening = (onResult) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Your browser does not support Speech Recognition.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US"; 
  recognition.interimResults = false; 
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("Recognized voice input:", transcript);

    if (onResult) {
      onResult(transcript); 
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };

  recognition.start();
};
