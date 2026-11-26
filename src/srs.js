import { INTERVALS, addDays, anchorOf, todayStr } from './dates';
import { t } from './i18n';

// Kart bilindiğinde bir sonraki tekrar aşamasına geçer.
// Birkaç tekrar kaçırıldıysa, tarihi zaten geçmiş aşamalar atlanır;
// böylece aynı kelime aynı gün iki kez sorulmaz.
export function markKnown(card, today = todayStr()) {
  const anchor = anchorOf(card);
  let s = card.stage + 1;
  while (s < INTERVALS.length && addDays(anchor, INTERVALS[s]) <= today) s++;
  return {
    ...card,
    stage: s,
    reviews: [...(card.reviews || []), { date: today, ok: true }],
  };
}

// Bilinemeyen kart sıfırlanır: plan bugünden baştan başlar
// (ertesi gün, 3. gün, 1. hafta, 2. hafta, 1. ay).
export function markUnknown(card, today = todayStr()) {
  return {
    ...card,
    stage: 0,
    anchor: today,
    reviews: [...(card.reviews || []), { date: today, ok: false }],
  };
}

// Kelimenin toplam kaç kez bilinemediği (günlük tekrarlar + Haznem testleri)
export function missCount(card) {
  const miss = (list) => (list || []).filter((r) => !r.ok).length;
  return miss(card.reviews) + miss(card.tests);
}

// Kelimenin toplam kaç kez sorulduğu (günlük tekrarlar + Haznem testleri)
export function attemptCount(card) {
  return (card.reviews || []).length + (card.tests || []).length;
}

// Hata oranı: bilinemeyen ÷ toplam deneme (0..1). Hiç sorulmadıysa 0.
export function errorRate(card) {
  const n = attemptCount(card);
  return n ? missCount(card) / n : 0;
}

// En son bilinemediği gün ('YYYY-MM-DD'), hiç bilinemediyse null
export function lastMiss(card) {
  const dates = [...(card.reviews || []), ...(card.tests || [])].filter((r) => !r.ok).map((r) => r.date);
  return dates.length ? dates.sort().at(-1) : null;
}

// En az bir kez bilinemeyen kelimeler, hata oranı yüksekten düşüğe.
// Eşitlikte daha çok bilinemeyen, o da eşitse en son bilinemeyen önce gelir.
export function hardestCards(cards) {
  return cards
    .filter((c) => missCount(c) > 0)
    .map((c) => ({ card: c, rate: errorRate(c), misses: missCount(c), attempts: attemptCount(c), last: lastMiss(c) }))
    .sort((a, b) => b.rate - a.rate || b.misses - a.misses || (b.last > a.last ? 1 : b.last < a.last ? -1 : 0));
}

// Çalışırken sırayla açılan ipuçları; kartta olmayanlar atlanır
export function hintsOf(card) {
  return [
    { key: 'example', label: t('hint.example'), text: card.example },
    { key: 'synonyms', label: t('hint.synonyms'), text: card.synonyms },
    { key: 'antonyms', label: t('hint.antonyms'), text: card.antonyms },
  ].filter((h) => h.text && h.text.trim());
}

// Haznem testi tekrar planını değiştirmez, sadece sonucu kaydeder
export function recordTest(card, ok, today = todayStr()) {
  return { ...card, tests: [...(card.tests || []), { date: today, ok }] };
}

// Kartı tekrar planına baştan sokar (Haznem testinde bilinemeyenler için, isteğe bağlı)
export function restartPlan(card, today = todayStr()) {
  return { ...card, stage: 0, anchor: today };
}
