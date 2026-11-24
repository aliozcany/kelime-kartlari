import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Kelimeler telefondaki bir SQLite dosyasında (kelime-kartlari.db) durur; sunucu yoktur.
// Her değişiklik yalnızca ilgili kartın satırını yazar.
//
// Uygulamadaki kart yapısı değişmedi:
// { id, en, tr, example, reference, topic, types: [], synonyms, antonyms,
//   createdAt: 'YYYY-MM-DD', anchor?, stage: 0..5, reviews: [{ date, ok }], tests?: [{ date, ok }] }
// `en` alanı çalışılan dildeki kelimedir (adı geriye dönük uyum için kaldı).
//
// Tablolar:
//   cards   – kartın kendisi; bilinmeyen/yeni alanlar `extra` sütununda JSON olarak saklanır
//   answers – her cevap bir satır: kind 'review' (günlük tekrar) ya da 'test' (Haznem testi)
//   topics  – konu adları
//   meta    – şema sürümü, AsyncStorage'dan taşındı mı

const DB_NAME = 'kelime-kartlari.db';
const SCHEMA_VERSION = 1;

// Eski (AsyncStorage) kayıt anahtarları: ilk açılışta buradan taşınır, sonra dokunulmaz
const OLD_CARDS_KEY = 'kelime-kartlari:v1';
const OLD_TOPICS_KEY = 'kelime-kartlari:topics:v1';

const COLUMNS = ['id', 'en', 'tr', 'example', 'reference', 'topic', 'types', 'synonyms', 'antonyms', 'createdAt', 'anchor', 'stage'];
const KNOWN = new Set([...COLUMNS, 'reviews', 'tests']);

let dbPromise = null;

function getDb() {
  if (!dbPromise) dbPromise = open();
  return dbPromise;
}

async function open() {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY NOT NULL, value TEXT);
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY NOT NULL,
      en TEXT NOT NULL,
      tr TEXT NOT NULL,
      example TEXT,
      reference TEXT,
      topic TEXT,
      types TEXT,
      synonyms TEXT,
      antonyms TEXT,
      created_at TEXT NOT NULL,
      anchor TEXT,
      stage INTEGER NOT NULL DEFAULT 0,
      extra TEXT
    );
    CREATE INDEX IF NOT EXISTS cards_created_at ON cards (created_at);
    CREATE INDEX IF NOT EXISTS cards_topic ON cards (topic);
    CREATE TABLE IF NOT EXISTS answers (
      card_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      seq INTEGER NOT NULL,
      date TEXT NOT NULL,
      ok INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS answers_card ON answers (card_id);
    CREATE TABLE IF NOT EXISTS topics (name TEXT PRIMARY KEY NOT NULL);
  `);
  await db.runAsync('INSERT OR IGNORE INTO meta (key, value) VALUES (?, ?)', 'schema_version', String(SCHEMA_VERSION));
  await migrateFromAsyncStorage(db);
  return db;
}

// ---- Yazmalar sırayla çalışır: iki işlem aynı anda transaction açmaya çalışmasın ----
let queue = Promise.resolve();
function enqueue(job) {
  const run = queue.then(async () => {
    const db = await getDb();
    await db.withTransactionAsync(() => job(db));
  });
  queue = run.catch((e) => console.warn('Veri kaydedilemedi', e));
  return queue;
}

// ---- Kart <-> satır ----
const str = (v) => (v === undefined || v === null ? null : String(v));

const UPSERT_CARD = `INSERT INTO cards (id, en, tr, example, reference, topic, types, synonyms, antonyms, created_at, anchor, stage, extra)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    en = excluded.en, tr = excluded.tr, example = excluded.example, reference = excluded.reference,
    topic = excluded.topic, types = excluded.types, synonyms = excluded.synonyms, antonyms = excluded.antonyms,
    created_at = excluded.created_at, anchor = excluded.anchor, stage = excluded.stage, extra = excluded.extra`;

// Hazır ifadeler bir kez derlenip her kart için yeniden kullanılır (toplu yazmada çok daha hızlı)
async function withCardWriter(db, fn) {
  const stmts = {
    card: await db.prepareAsync(UPSERT_CARD),
    clear: await db.prepareAsync('DELETE FROM answers WHERE card_id = ?'),
    answer: await db.prepareAsync('INSERT INTO answers (card_id, kind, seq, date, ok) VALUES (?, ?, ?, ?, ?)'),
  };
  try {
    return await fn((card) => writeCard(stmts, card));
  } finally {
    await Promise.all(Object.values(stmts).map((st) => st.finalizeAsync()));
  }
}

async function writeCard(stmts, card) {
  const extra = {};
  Object.keys(card).forEach((k) => {
    if (!KNOWN.has(k)) extra[k] = card[k];
  });
  await stmts.card.executeAsync(
    card.id,
    String(card.en),
    String(card.tr),
    str(card.example),
    str(card.reference),
    str(card.topic),
    Array.isArray(card.types) ? JSON.stringify(card.types) : null,
    str(card.synonyms),
    str(card.antonyms),
    card.createdAt,
    str(card.anchor),
    Number(card.stage) || 0,
    Object.keys(extra).length ? JSON.stringify(extra) : null
  );
  // Cevap geçmişi kısa olduğundan kart her yazıldığında baştan yazılır
  await stmts.clear.executeAsync(card.id);
  const rows = [
    ...(card.reviews || []).map((r, i) => ['review', i, r]),
    ...(card.tests || []).map((r, i) => ['test', i, r]),
  ];
  for (const [kind, seq, r] of rows) {
    await stmts.answer.executeAsync(card.id, kind, seq, String(r.date), r.ok ? 1 : 0);
  }
}

function rowToCard(row) {
  const card = {
    ...(row.extra ? safeParse(row.extra, {}) : {}),
    id: row.id,
    en: row.en,
    tr: row.tr,
    example: row.example ?? '',
    reference: row.reference ?? '',
    topic: row.topic ?? null,
    synonyms: row.synonyms ?? '',
    antonyms: row.antonyms ?? '',
    createdAt: row.created_at,
    stage: row.stage,
    reviews: [],
  };
  if (row.types) card.types = safeParse(row.types, []);
  if (row.anchor) card.anchor = row.anchor;
  return card;
}

function safeParse(s, fallback) {
  try {
    return JSON.parse(s);
  } catch (e) {
    return fallback;
  }
}

// ---- Okuma ----
export async function loadAll() {
  try {
    const db = await getDb();
    const rows = await db.getAllAsync('SELECT * FROM cards');
    const answers = await db.getAllAsync('SELECT card_id, kind, date, ok FROM answers ORDER BY card_id, kind, seq');
    const topicRows = await db.getAllAsync('SELECT name FROM topics');

    const byId = new Map();
    const cards = rows.map((r) => {
      const c = rowToCard(r);
      byId.set(c.id, c);
      return c;
    });
    answers.forEach((a) => {
      const c = byId.get(a.card_id);
      if (!c) return;
      const entry = { date: a.date, ok: !!a.ok };
      if (a.kind === 'test') (c.tests || (c.tests = [])).push(entry);
      else c.reviews.push(entry);
    });
    const topics = topicRows.map((t) => t.name).sort((a, b) => a.localeCompare(b, 'tr'));
    return { cards, topics };
  } catch (e) {
    console.warn('Veri okunamadı', e);
    return { cards: [], topics: [] };
  }
}

// ---- Yazma ----
export const saveCard = (card) => enqueue((db) => withCardWriter(db, (write) => write(card)));

export const deleteCard = (id) =>
  enqueue(async (db) => {
    await db.runAsync('DELETE FROM answers WHERE card_id = ?', id);
    await db.runAsync('DELETE FROM cards WHERE id = ?', id);
  });

export const saveTopic = (name) => enqueue((db) => db.runAsync('INSERT OR IGNORE INTO topics (name) VALUES (?)', name));

// Konu silinince kartlar silinmez, sadece konuları boşaltılır
export const deleteTopic = (name) =>
  enqueue(async (db) => {
    await db.runAsync('DELETE FROM topics WHERE name = ?', name);
    await db.runAsync('UPDATE cards SET topic = NULL WHERE topic = ?', name);
  });

// Yedekten geri yükleme: her şey silinip yedektekiler yazılır (tek transaction; yarıda kalırsa hiçbiri olmaz)
export const replaceAll = ({ cards, topics }) => enqueue((db) => writeEverything(db, cards, topics, true));

async function writeEverything(db, cards, topics, clear) {
  if (clear) {
    await db.execAsync('DELETE FROM answers; DELETE FROM cards; DELETE FROM topics;');
  }
  for (const t of topics) await db.runAsync('INSERT OR IGNORE INTO topics (name) VALUES (?)', t);
  await withCardWriter(db, async (write) => {
    for (const c of cards) await write(c);
  });
}

// ---- AsyncStorage'dan tek seferlik taşıma ----
// Eski veriler silinmez; bir sorun çıkarsa geri dönülebilsin diye yerinde bırakılır.
async function migrateFromAsyncStorage(db) {
  const done = await db.getFirstAsync('SELECT value FROM meta WHERE key = ?', 'migrated_from_asyncstorage');
  if (done) return;

  let cards = [];
  let topics = [];
  try {
    const [rawCards, rawTopics] = await Promise.all([AsyncStorage.getItem(OLD_CARDS_KEY), AsyncStorage.getItem(OLD_TOPICS_KEY)]);
    cards = rawCards ? JSON.parse(rawCards) : [];
    topics = rawTopics ? JSON.parse(rawTopics) : [];
  } catch (e) {
    // Okunamadıysa işaretlemeden çık: bir sonraki açılışta yeniden denenir
    console.warn('Eski veriler okunamadı', e);
    return;
  }

  await db.withTransactionAsync(async () => {
    const existing = await db.getFirstAsync('SELECT COUNT(*) AS n FROM cards');
    // Veritabanında zaten kart varsa (ör. taşıma yarıda kesilmediyse) üzerine yazılmaz
    if (!existing?.n) {
      const valid = Array.isArray(cards) ? cards.filter((c) => c && typeof c.id === 'string' && c.createdAt) : [];
      const allTopics = new Set(Array.isArray(topics) ? topics.filter((t) => typeof t === 'string') : []);
      valid.forEach((c) => c.topic && allTopics.add(c.topic));
      await writeEverything(db, valid, [...allTopics], false);
    }
    await db.runAsync(
      'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
      'migrated_from_asyncstorage',
      new Date().toISOString()
    );
  });
}

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
