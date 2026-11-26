// Tarihler "YYYY-MM-DD" string olarak tutulur (yerel saat). Böylece saat dilimi kaymaları olmaz.

import { getUiLang, months, t, weekdays } from './i18n';

export const INTERVALS = [1, 3, 7, 14, 30]; // eklendikten sonraki günler
export const stageLabel = (stage) => t(`stage.${stage}`);

const isEn = () => getUiLang() === 'en';

export function toStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parse(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const todayStr = () => toStr(new Date());

export function addDays(s, n) {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return toStr(d);
}

// Tekrar planının başladığı gün: eklenme günü ya da en son bilinemediği gün
export const anchorOf = (card) => card.anchor || card.createdAt;

// Kartın sıradaki tekrar tarihi; tüm tekrarlar bittiyse null
export function nextDue(card) {
  if (card.stage >= INTERVALS.length) return null;
  return addDays(anchorOf(card), INTERVALS[card.stage]);
}

// Tarihi gelmiş (veya kaçırılmış) tekrar var mı
export function isDue(card, today = todayStr()) {
  const n = nextDue(card);
  return n !== null && n <= today;
}

// Haftanın pazartesisi
export function weekStart(s) {
  const d = parse(s);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return toStr(d);
}

export const monthKey = (s) => s.slice(0, 7);

// Türkçe "26 Kasım Perşembe", İngilizce "Thursday, 26 November"
export function formatDay(s) {
  const d = parse(s);
  const day = `${d.getDate()} ${months()[d.getMonth()]}`;
  return isEn() ? `${weekdays()[d.getDay()]}, ${day}` : `${day} ${weekdays()[d.getDay()]}`;
}

export function formatShort(s) {
  const d = parse(s);
  const m = months()[d.getMonth()];
  return `${d.getDate()} ${isEn() ? m.slice(0, 3) : m}`;
}

export function formatWeek(startStr) {
  const a = parse(startStr);
  const b = parse(addDays(startStr, 6));
  const M = months();
  if (a.getMonth() === b.getMonth()) {
    return `${a.getDate()} – ${b.getDate()} ${M[a.getMonth()]}`;
  }
  return `${a.getDate()} ${M[a.getMonth()]} – ${b.getDate()} ${M[b.getMonth()]}`;
}

export function formatMonth(key) {
  const [y, m] = key.split('-').map(Number);
  return `${months()[m - 1]} ${y}`;
}

// Tüm tekrarları bitmiş kart: günlük çalışmaya bir daha gelmez, Kelime Haznem'de durur
export const isMastered = (card) => card.stage >= INTERVALS.length;
