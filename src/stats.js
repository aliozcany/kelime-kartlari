import { addDays, isMastered, todayStr } from './dates';

// İstatistikler kartların kendisinden hesaplanır (eklenme günü + cevap kayıtları);
// ayrı bir kayıt tutulmaz. Bir gün "aktif" sayılır: o gün kelime eklendiyse
// ya da en az bir kart (günlük tekrar veya Haznem testi) cevaplandıysa.

// gün → { added, reviewed, ok, answers }
export function dailyActivity(cards) {
  const m = new Map();
  const get = (d) => {
    if (!m.has(d)) m.set(d, { added: 0, reviewed: 0, ok: 0, answers: 0 });
    return m.get(d);
  };
  cards.forEach((c) => {
    get(c.createdAt).added++;
    const seen = new Set();
    [...(c.reviews || []), ...(c.tests || [])].forEach((r) => {
      const day = get(r.date);
      day.answers++;
      if (r.ok) day.ok++;
      // Aynı kart aynı gün iki kez cevaplansa da bir kelime sayılır
      if (!seen.has(r.date)) {
        seen.add(r.date);
        day.reviewed++;
      }
    });
  });
  return m;
}

// Bugün henüz bir şey yapılmadıysa seri bozulmaz; dünden geriye sayılır
export function currentStreak(activity, today = todayStr()) {
  let d = activity.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (activity.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export function longestStreak(activity) {
  const days = [...activity.keys()].sort();
  let best = 0;
  let run = 0;
  let prev = null;
  days.forEach((d) => {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  });
  return best;
}

export function computeStats(cards, today = todayStr()) {
  const activity = dailyActivity(cards);
  let ok = 0;
  let answers = 0;
  activity.forEach((v) => {
    ok += v.ok;
    answers += v.answers;
  });
  const mastered = cards.filter(isMastered).length;
  // Son 7 gün, en eski önce
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    return { date, ...(activity.get(date) || { added: 0, reviewed: 0, ok: 0, answers: 0 }) };
  });
  return {
    streak: currentStreak(activity, today),
    best: longestStreak(activity),
    activeToday: activity.has(today),
    total: cards.length,
    mastered,
    learning: cards.length - mastered,
    accuracy: answers ? ok / answers : null,
    answers,
    activeDays: activity.size,
    week,
    addedToday: activity.get(today)?.added || 0,
  };
}
