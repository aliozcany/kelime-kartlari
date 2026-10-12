import { INTERVALS, addDays, anchorOf, todayStr } from './dates';

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
