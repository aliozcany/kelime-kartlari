import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'kelime-kartlari:v1';
const TOPICS_KEY = 'kelime-kartlari:topics:v1';

// Kart yapısı:
// { id, en, tr, example, reference, topic, createdAt: 'YYYY-MM-DD', anchor?, stage: 0..5, reviews: [{ date, ok }] }
// reference (nerede görüldü) ve topic (konu adı) isteğe bağlıdır; boş string / null olabilir.

async function load(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Veri okunamadı', key, e);
    return [];
  }
}

async function save(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Veri kaydedilemedi', key, e);
  }
}

export const loadCards = () => load(KEY);
export const saveCards = (cards) => save(KEY, cards);
export const loadTopics = () => load(TOPICS_KEY);
export const saveTopics = (topics) => save(TOPICS_KEY, topics);

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
