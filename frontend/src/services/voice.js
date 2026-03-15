/**
 * Web Speech API wrapper for voice interactions.
 */

export function isSupported() {
  return !!(
    window.SpeechRecognition || window.webkitSpeechRecognition
  ) && !!window.speechSynthesis;
}

/**
 * Start speech recognition.
 * @param {function} onResult - Called with the transcript string.
 * @param {function} onError  - Called on recognition error.
 * @returns {SpeechRecognition} recognition instance
 */
export function startListening(onResult, onError) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError?.(new Error('Speech recognition not supported'));
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    onResult?.(transcript);
  };

  recognition.onerror = (event) => {
    onError?.(event.error);
  };

  recognition.start();
  return recognition;
}

/**
 * Stop a running speech recognition instance.
 */
export function stopListening(recognition) {
  if (recognition) {
    recognition.stop();
  }
}

/**
 * Speak text aloud using the SpeechSynthesis API.
 * @param {string} text
 * @param {object} options - { rate, pitch, voice }
 * @returns {SpeechSynthesisUtterance}
 */
export function speak(text, options = {}) {
  if (!window.speechSynthesis) return null;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? 1;
  utterance.pitch = options.pitch ?? 1;

  if (options.voice) {
    utterance.voice = options.voice;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}
