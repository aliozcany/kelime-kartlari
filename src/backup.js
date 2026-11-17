// Yedek bir JSON dosyası olarak kaydedilir; geri yüklerken dosya seçilir (ya da metin yapıştırılır).
// version 2: kartlarda types, synonyms, antonyms, tests alanları da olabilir (hepsi isteğe bağlı).

export function makeBackup(cards, topics) {
  return JSON.stringify({
    app: 'kelime-kartlari',
    version: 2,
    exportedAt: new Date().toISOString(),
    topics,
    cards,
  });
}

const isCard = (c) =>
  c &&
  typeof c.id === 'string' &&
  typeof c.en === 'string' &&
  typeof c.tr === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(c.createdAt) &&
  Number.isInteger(c.stage);

// Hatalıysa kullanıcıya gösterilecek mesajla Error fırlatır
export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text.trim());
  } catch (e) {
    throw new Error('Metin geçerli bir yedek değil. Yedeğin tamamını kopyaladığından emin ol.');
  }
  const cards = Array.isArray(data) ? data : data?.cards;
  if (!Array.isArray(cards)) throw new Error('Yedekte kart listesi bulunamadı.');
  if (!cards.every(isCard)) throw new Error('Yedekteki kartlardan bazıları bozuk.');

  // Kartlarda geçen ama konu listesinde olmayan konuları da ekle
  const topics = new Set(Array.isArray(data.topics) ? data.topics.filter((t) => typeof t === 'string') : []);
  cards.forEach((c) => c.topic && topics.add(c.topic));

  return {
    cards: cards.map((c) => ({ ...c, reviews: Array.isArray(c.reviews) ? c.reviews : [] })),
    topics: [...topics],
  };
}
