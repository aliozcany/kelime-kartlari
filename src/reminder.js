import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { addDays, nextDue, parse, todayStr } from './dates';
import { t } from './i18n';

// Günlük hatırlatma: tekrarlayan tek bir bildirim yerine önümüzdeki DAYS_AHEAD gün için
// ayrı ayrı bildirim kurulur. Böylece her bildirim o gün kaç tekrar olacağını söyler
// (kartların sonraki tekrar tarihleri bilindiği için önceden hesaplanabilir).
// Kartlar değiştikçe ve uygulama her açıldığında plan baştan kurulur.

export const REMINDER_SUPPORTED = Platform.OS !== 'web';
const DAYS_AHEAD = 14;
const CHANNEL = 'daily-reminder';

if (REMINDER_SUPPORTED) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// Android 13+ izin penceresi ancak bir kanal varken çıkar; kanal adı arayüz dilinde görünür
async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: t('notif.channel'),
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// İzin varsa ya da verildiyse true
export async function ensurePermission() {
  if (!REMINDER_SUPPORTED) return false;
  await ensureChannel();
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  if (!cur.canAskAgain) return false;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

async function reschedule(cards, reminder) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!reminder?.enabled) return;
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) return;
  await ensureChannel();

  const now = new Date();
  const today = todayStr();
  const dues = cards.map(nextDue).filter(Boolean);

  for (let i = 0; i < DAYS_AHEAD; i++) {
    const day = addDays(today, i);
    const at = parse(day);
    at.setHours(reminder.hour, reminder.minute, 0, 0);
    if (at <= now) continue;
    // O güne kadar tarihi gelmiş her kart o gün sorulur (kaçırılanlar birikir)
    const n = dues.filter((d) => d <= day).length;
    await Notifications.scheduleNotificationAsync({
      content: n
        ? { title: t('notif.dueTitle', { n }), body: t('notif.dueBody') }
        : { title: t('notif.emptyTitle'), body: t('notif.emptyBody') },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
    });
  }
}

// Üst üste gelen çağrılar sırayla çalışır; iptal/kurma adımları birbirine karışmaz
let chain = Promise.resolve();
export function scheduleReminders(cards, reminder) {
  if (!REMINDER_SUPPORTED) return chain;
  chain = chain.then(() => reschedule(cards, reminder)).catch((e) => console.warn('Hatırlatma kurulamadı', e));
  return chain;
}
