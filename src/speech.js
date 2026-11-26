import * as Speech from 'expo-speech';

// Cihazın metin okuma motoruyla telaffuz. lang: settings'teki LANGUAGES öğesi (speech: 'en-US' gibi).
// O dilin sesi cihazda yüklü değilse motor varsayılan sesle okur.
export function speak(text, lang) {
  const s = (text || '').trim();
  if (!s) return;
  Speech.stop();
  Speech.speak(s, { language: lang?.speech, rate: 0.9 });
}

export const stopSpeaking = () => Speech.stop();
