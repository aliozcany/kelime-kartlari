import { Alert } from 'react-native';
import * as Speech from 'expo-speech';
import { t } from './i18n';

// Cihazın metin okuma motoruyla telaffuz. lang: settings'teki LANGUAGES öğesi (speech: 'en-US' gibi).
// O dilin sesi cihazda yoksa motor varsayılan sesle (çoğu zaman Türkçe) okur; bunun yerine uyarı gösterilir.

const known = new Set(); // sesi olduğu doğrulanmış diller ('en', 'de'…)

// true: ses var. false: ses listesi geldi ama bu dil yok. null: liste alınamadı / boş (emin değiliz)
async function hasVoice(key) {
  if (known.has(key)) return true;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (!voices?.length) return null;
    const ok = voices.some((v) => (v.language || '').toLowerCase().replace('_', '-').split('-')[0] === key);
    if (ok) known.add(key);
    return ok;
  } catch (e) {
    return null;
  }
}

// auto: kart gelince kendiliğinden okuma; ses yoksa uyarı çıkarmadan sessiz kalır
export async function speak(text, lang, { auto = false } = {}) {
  const s = (text || '').trim();
  if (!s) return;
  const voice = await hasVoice(lang?.key);
  if (voice === false) {
    if (!auto) {
      Alert.alert(t('speech.noVoiceTitle', { lang: lang.label }), t('speech.noVoiceText', { lang: lang.label }), [
        { text: t('speech.ok') },
      ]);
    }
    return;
  }
  Speech.stop();
  Speech.speak(s, { language: lang?.speech, rate: 0.9 });
}

export const stopSpeaking = () => Speech.stop();
