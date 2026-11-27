// Arayüz dili. Metinler anahtarla alınır: t('study.left'), t('list.words', { n: 3 }).
// Değer bir fonksiyonsa parametrelerle çağrılır (İngilizcedeki tekil/çoğul için).
// Seçili dil modül düzeyinde tutulur; SettingsProvider değişince setUiLang çağırır ve
// ağaç yeniden çizilir. useMemo içinde metin üretenler bağımlılığa uiLang eklemeli.

const s = (n, one, many) => (n === 1 ? one : many);

const tr = {
  'tabs.list': 'Kelimelerim',
  'tabs.vault': 'Haznem',
  'tabs.study': 'Çalış',
  'tabs.add': 'Ekle',
  'tabs.hard': 'Zorlandıklarım',
  'title.list': 'Kelimelerim',
  'title.vault': 'Kelime Haznem',
  'title.study': 'Bugünkü tekrar',
  'title.add': 'Yeni kelime',
  'title.hard': 'Zorlandıklarım',
  'header.summary': ({ n, due }) => `${n} kelime · bugün ${due} tekrar`,
  'header.settings': 'Ayarlar',

  'common.close': 'Kapat',
  'common.cancel': 'Vazgeç',
  'common.delete': 'Sil',
  'common.edit': 'Düzenle',
  'common.words': ({ n }) => `${n} kelime`,
  'common.misses': ({ n }) => `${n} hata`,
  'common.reviews': ({ done, total }) => `${done}/${total} tekrar`,
  'common.syn': 'Eş',
  'common.ant': 'Zıt',
  'common.meaning': 'Türkçe',
  'common.listen': 'Dinle',
  'speech.noVoiceTitle': ({ lang }) => `${lang} ses yüklü değil`,
  'speech.noVoiceText': ({ lang }) =>
    `Telefonunda ${lang} okuma sesi yok, bu yüzden kelime yanlış aksanla okunurdu. Yüklemek için: Ayarlar → Sistem → Diller → Metin okuma → Google Konuşma Hizmetleri → ses verilerini yükle → ${lang}.`,
  'speech.ok': 'Tamam',

  'answer.no': 'Bilemedim',
  'answer.yes': 'Bildim',

  'stage.0': '1. gün',
  'stage.1': '3. gün',
  'stage.2': '1. hafta',
  'stage.3': '2. hafta',
  'stage.4': '1. ay',

  'hint.example': 'Cümle',
  'hint.synonyms': 'Eş anlamlı',
  'hint.antonyms': 'Zıt anlamlı',
  'hint.none': 'Bu kelime için ipucu eklenmemiş.',
  'hint.first': 'İpucu',
  'hint.next': 'Sonraki ipucu',

  'card.tapToFlip': 'Çevirmek için dokun',
  'card.added': ({ date }) => `Eklendi ${date}`,
  'card.missed': ({ n }) => `${n} kez bilinemedi`,
  'card.edit': 'Kartı düzenle',

  'paged.showing': ({ shown, total }) => `${shown} / ${total} gösteriliyor`,
  'paged.more': 'Daha fazla göster',

  'form.saveAnyway': 'Yine de kaydet',
  'form.addAnyway': 'Yine de ekle',
  'form.save': 'Kaydet',
  'form.add': 'Kartı ekle',
  'form.added': ({ word }) => `“${word}” eklendi`,
  'form.removeTopic': 'Konuyu sil',
  'form.removeTopicQ': ({ topic }) => `“${topic}” konusu silinsin mi?`,
  'form.removeTopicUsed': ({ n }) => `${n} kartın konusu kaldırılacak, kartlar silinmez.`,
  'form.duplicate': 'Bu kelime zaten var:',
  'form.type': 'Tür',
  'form.topic': 'Konu',
  'form.topicHint': 'uzun bas: sil',
  'form.newTopic': 'Yeni konu',
  'form.addTopic': '+ Konu',
  'form.details': 'Ayrıntılar',
  'form.detailsFilled': ({ n }) => `${n} alan dolu`,
  'form.detailsHint': 'cümle, eş / zıt anlam, kaynak',
  'form.example': 'Örnek cümle',
  'form.exampleHint': 'ilk ipucu',
  'form.synonyms': 'Eş anlamlı',
  'form.antonyms': 'Zıt anlamlı',
  'form.reference': 'Nerede gördün',
  'form.referencePh': 'Friends 3. sezon, BBC haberi',

  'add.footer': ({ n }) => `Bugün ${n} kelime ekledin. Bugünküler şu günlerde sorulacak:`,

  'study.doneTitle': 'Bugünlük bitti.',
  'study.emptyTitle': 'Bugün tekrar yok.',
  'study.doneText': ({ n }) => `${n} kelimeyi tekrar ettin. Yarın görüşürüz.`,
  'study.emptyText': 'Yeni kelime ekle; eklediğin kelimeler ertesi gün buraya gelir.',
  'study.left': 'kaldı',
  'study.stageReview': ({ stage }) => `${stage} tekrarı`,

  'list.mode.day': 'Gün',
  'list.mode.week': 'Hafta',
  'list.mode.month': 'Ay',
  'list.mode.cal': 'Takvim',
  'list.inVault': 'Haznede',
  'list.late': 'Gecikti',
  'list.today': 'Bugün',
  'list.search': 'Kelime, anlam ya da cümle ara',
  'list.searchResults': 'Arama sonuçları',
  'list.deleteTitle': 'Kartı sil',
  'list.deleteQ': ({ word }) => `“${word}” silinsin mi?`,
  'list.empty': 'Henüz kelime eklemedin.',
  'list.notFound': ({ q }) => `“${q}” bulunamadı.`,
  'list.calEmptyDay': 'Bu gün kelime eklenmemiş.',
  'list.calPick': 'Kelimelerini görmek için bir güne dokun.',

  'hard.intro': 'Hata oranına göre sıralı: bilinemediği sayı ÷ toplam sorulduğu sayı. Burada cevap vermezsin, tekrar planı değişmez.',
  'hard.show': 'Anlamları göster',
  'hard.hide': 'Anlamları gizle',
  'hard.emptyTitle': 'Henüz zorlandığın kelime yok.',
  'hard.emptyText': 'Çalışırken ya da Haznem testinde “Bilemedim” dediğin kelimeler burada, en çok zorlandığından başlayarak sıralanır.',
  'hard.reveal': 'göster',
  'hard.lastMiss': ({ date }) => `Son bilinemediği gün ${date}`,

  'vault.restartTitle': 'Tekrar planına al',
  'vault.restartText': ({ n }) => `${n} kelime günlük çalışmaya geri dönecek ve 1. gün, 3. gün, 1. hafta… planı baştan başlayacak.`,
  'vault.restartOk': 'Planına al',
  'vault.allKnown': 'Hepsini bildin.',
  'vault.missedN': ({ n }) => `${n} kelimeyi bilemedin`,
  'vault.missedList': 'Bilemediklerin',
  'vault.restartMissed': 'Bilemediklerimi tekrar planına al',
  'vault.back': "Haznem'e dön",
  'vault.endTest': 'Testi bitir',
  'vault.test': 'Haznem testi',
  'vault.countLabel': 'kelime haznende',
  'vault.intro': '5/5 tekrarı biten kelimeler buraya gelir ve günlük çalışmada artık sorulmaz. İstediğin zaman kendini test edebilirsin; test tekrar planını değiştirmez.',
  'vault.start': 'Teste başla',
  'vault.empty': 'Henüz 5/5 tamamlanan kelime yok.',

  'settings.title': 'Ayarlar',
  'settings.appearance': 'Görünüm',
  'settings.theme.system': 'Sistem',
  'settings.theme.light': 'Açık',
  'settings.theme.dark': 'Koyu',
  'settings.uiLang': 'Uygulama dili',
  'settings.studyLang': 'Çalıştığın dil',
  'settings.studyLangHint': 'Kartların ön yüzündeki dil. Değiştirmek mevcut kelimelerine dokunmaz, sadece etiketleri ve örnekleri değiştirir.',
  'settings.speech': 'Telaffuz',
  'settings.speechHint': 'Kartlardaki hoparlöre dokununca kelime cihazın sesiyle okunur.',
  'settings.autoSpeak': 'Kart gelince otomatik oku',
  'settings.reminder': 'Günlük hatırlatma',
  'settings.reminderHint': 'Seçtiğin saatte o gün kaç tekrarın olduğunu söyleyen bir bildirim gelir.',
  'settings.reminderOn': 'Hatırlatma açık',
  'settings.reminderDenied': 'Bildirim izni verilmedi. Telefonun ayarlarından Kelime Kartları için bildirimlere izin verebilirsin.',
  'settings.backup': 'Yedek',
  'settings.goal': 'Günlük kelime hedefi',
  'settings.goalHint': 'Her gün kaç yeni kelime eklemek istediğini seç. Hedefe ulaşınca çubuk yeşile döner.',
  'settings.goalOff': 'Kapalı',

  'goal.label': 'Bugünkü hedef',
  'goal.done': 'Hedef tamam',

  'stats.title': 'İstatistik',
  'stats.open': 'Seri ve istatistik',
  'stats.streakDays': ({ n }) => `${n} günlük seri`,
  'stats.streakZero': 'Bugün bir kelime ekle ya da tekrar yap, seri başlasın.',
  'stats.streakSafe': 'Bugünü tamamladın, seri devam ediyor.',
  'stats.streakKeep': 'Seriyi bozmamak için bugün bir kelime ekle ya da tekrar yap.',
  'stats.week': 'Son 7 gün · eklenen kelime',
  'stats.weekSummary': ({ added, reviewed }) => `Bu hafta ${added} kelime ekledin, ${reviewed} kelime tekrar ettin.`,
  'stats.goalHint': 'Yeşil günlerde hedefe ulaştın.',
  'stats.overall': 'Genel',
  'stats.total': 'toplam kelime',
  'stats.mastered': 'haznede (5/5)',
  'stats.learning': 'öğreniliyor',
  'stats.accuracy': 'doğru cevap',
  'stats.pct': ({ n }) => `%${n}`,
  'stats.best': 'en uzun seri (gün)',
  'stats.activeDays': 'çalışılan gün',

  'notif.dueTitle': ({ n }) => `Bugün ${n} kelime seni bekliyor`,
  'notif.dueBody': 'Birkaç dakikalık tekrar, kelimeleri kalıcı yapar.',
  'notif.emptyTitle': 'Bugün tekrar yok',
  'notif.emptyBody': 'Yeni bir kelime eklemeye ne dersin?',
  'notif.channel': 'Günlük hatırlatma',

  'backup.shareUnsupported': 'Bu cihazda paylaşım desteklenmiyor.',
  'backup.saveDialog': 'Yedeği kaydet',
  'backup.exportFailed': 'Yedek alınamadı',
  'backup.restoreTitle': 'Yedeği geri yükle',
  'backup.restoreText': ({ now, next }) => `Şu anki ${now} kelime silinecek, yerine yedekteki ${next} kelime yüklenecek.`,
  'backup.restoreOk': 'Geri yükle',
  'backup.openFailed': 'Dosya açılamadı',
  'backup.readFailed': 'Yedek okunamadı',
  'backup.exportTitle': 'Yedek al',
  'backup.exportText': ({ n, topics }) =>
    `${n} kelime ve ${topics} konu tek bir .json dosyası olarak kaydedilir. Açılan menüden Drive'a, Dosyalar'a, e-postaya ya da WhatsApp'a gönderebilirsin.`,
  'backup.exportBtn': 'Yedek dosyasını kaydet',
  'backup.importTitle': 'Geri yükle',
  'backup.importText': 'Daha önce kaydettiğin yedek dosyasını seç. Mevcut kelimelerin yerine yüklenir.',
  'backup.importBtn': 'Yedek dosyası seç',
  'backup.pasteToggle': 'Eski yöntem: metni yapıştır',
  'backup.pasteBtn': 'Metinden geri yükle',
  'backup.errJson': 'Metin geçerli bir yedek değil. Yedeğin tamamını kopyaladığından emin ol.',
  'backup.errNoCards': 'Yedekte kart listesi bulunamadı.',
  'backup.errBroken': 'Yedekteki kartlardan bazıları bozuk.',

  'lang.en': 'İngilizce',
  'lang.de': 'Almanca',
  'lang.fr': 'Fransızca',
  'lang.es': 'İspanyolca',
  'lang.it': 'İtalyanca',
  'lang.ru': 'Rusça',
  'lang.ar': 'Arapça',
  'lang.ja': 'Japonca',
  'lang.ko': 'Korece',
};

const en = {
  'tabs.list': 'My words',
  'tabs.vault': 'Vault',
  'tabs.study': 'Study',
  'tabs.add': 'Add',
  'tabs.hard': 'Tough ones',
  'title.list': 'My words',
  'title.vault': 'Word vault',
  'title.study': "Today's review",
  'title.add': 'New word',
  'title.hard': 'Tough ones',
  'header.summary': ({ n, due }) => `${n} ${s(n, 'word', 'words')} · ${due} to review today`,
  'header.settings': 'Settings',

  'common.close': 'Close',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.words': ({ n }) => `${n} ${s(n, 'word', 'words')}`,
  'common.misses': ({ n }) => `${n} ${s(n, 'miss', 'misses')}`,
  'common.reviews': ({ done, total }) => `${done}/${total} reviews`,
  'common.syn': 'Syn',
  'common.ant': 'Ant',
  'common.meaning': 'Meaning',
  'common.listen': 'Listen',
  'speech.noVoiceTitle': ({ lang }) => `No ${lang} voice installed`,
  'speech.noVoiceText': ({ lang }) =>
    `Your phone has no ${lang} text-to-speech voice, so the word would be read with the wrong accent. To install one: Settings → System → Languages → Text-to-speech → Speech Services by Google → Install voice data → ${lang}.`,
  'speech.ok': 'OK',

  'answer.no': "Didn't know",
  'answer.yes': 'Knew it',

  'stage.0': 'Day 1',
  'stage.1': 'Day 3',
  'stage.2': 'Week 1',
  'stage.3': 'Week 2',
  'stage.4': 'Month 1',

  'hint.example': 'Sentence',
  'hint.synonyms': 'Synonyms',
  'hint.antonyms': 'Antonyms',
  'hint.none': 'No hints added for this word.',
  'hint.first': 'Hint',
  'hint.next': 'Next hint',

  'card.tapToFlip': 'Tap to flip',
  'card.added': ({ date }) => `Added ${date}`,
  'card.missed': ({ n }) => `missed ${n} ${s(n, 'time', 'times')}`,
  'card.edit': 'Edit card',

  'paged.showing': ({ shown, total }) => `Showing ${shown} of ${total}`,
  'paged.more': 'Show more',

  'form.saveAnyway': 'Save anyway',
  'form.addAnyway': 'Add anyway',
  'form.save': 'Save',
  'form.add': 'Add card',
  'form.added': ({ word }) => `“${word}” added`,
  'form.removeTopic': 'Delete topic',
  'form.removeTopicQ': ({ topic }) => `Delete the topic “${topic}”?`,
  'form.removeTopicUsed': ({ n }) => `${n} ${s(n, 'card loses', 'cards lose')} this topic; the cards are kept.`,
  'form.duplicate': 'This word already exists:',
  'form.type': 'Type',
  'form.topic': 'Topic',
  'form.topicHint': 'long press: delete',
  'form.newTopic': 'New topic',
  'form.addTopic': '+ Topic',
  'form.details': 'Details',
  'form.detailsFilled': ({ n }) => `${n} ${s(n, 'field', 'fields')} filled`,
  'form.detailsHint': 'sentence, synonyms / antonyms, source',
  'form.example': 'Example sentence',
  'form.exampleHint': 'first hint',
  'form.synonyms': 'Synonyms',
  'form.antonyms': 'Antonyms',
  'form.reference': 'Where you saw it',
  'form.referencePh': 'Friends season 3, a BBC article',

  'add.footer': ({ n }) => `You added ${n} ${s(n, 'word', 'words')} today. They will come up on:`,

  'study.doneTitle': 'All done for today.',
  'study.emptyTitle': 'Nothing to review today.',
  'study.doneText': ({ n }) => `You reviewed ${n} ${s(n, 'word', 'words')}. See you tomorrow.`,
  'study.emptyText': 'Add new words; they show up here the next day.',
  'study.left': 'left',
  'study.stageReview': ({ stage }) => `${stage} review`,

  'list.mode.day': 'Day',
  'list.mode.week': 'Week',
  'list.mode.month': 'Month',
  'list.mode.cal': 'Calendar',
  'list.inVault': 'In vault',
  'list.late': 'Overdue',
  'list.today': 'Today',
  'list.search': 'Search words, meanings or sentences',
  'list.searchResults': 'Search results',
  'list.deleteTitle': 'Delete card',
  'list.deleteQ': ({ word }) => `Delete “${word}”?`,
  'list.empty': "You haven't added any words yet.",
  'list.notFound': ({ q }) => `No results for “${q}”.`,
  'list.calEmptyDay': 'No words added on this day.',
  'list.calPick': 'Tap a day to see its words.',

  'hard.intro': "Sorted by error rate: times missed ÷ times asked. You don't answer here, and the review plan doesn't change.",
  'hard.show': 'Show meanings',
  'hard.hide': 'Hide meanings',
  'hard.emptyTitle': 'No tough words yet.',
  'hard.emptyText': 'Words you mark “Didn\'t know” while studying or in a vault test are listed here, toughest first.',
  'hard.reveal': 'show',
  'hard.lastMiss': ({ date }) => `Last missed ${date}`,

  'vault.restartTitle': 'Back to the review plan',
  'vault.restartText': ({ n }) =>
    `${n} ${s(n, 'word goes', 'words go')} back to daily study and the Day 1, Day 3, Week 1… plan starts over.`,
  'vault.restartOk': 'Add to plan',
  'vault.allKnown': 'You knew them all.',
  'vault.missedN': ({ n }) => `You missed ${n} ${s(n, 'word', 'words')}`,
  'vault.missedList': 'Missed',
  'vault.restartMissed': 'Put missed words back in the plan',
  'vault.back': 'Back to vault',
  'vault.endTest': 'End test',
  'vault.test': 'Vault test',
  'vault.countLabel': 'words in your vault',
  'vault.intro': "Words that finish all 5 reviews land here and no longer come up in daily study. Test yourself whenever you like; tests don't change the review plan.",
  'vault.start': 'Start test',
  'vault.empty': 'No words have finished 5/5 yet.',

  'settings.title': 'Settings',
  'settings.appearance': 'Appearance',
  'settings.theme.system': 'System',
  'settings.theme.light': 'Light',
  'settings.theme.dark': 'Dark',
  'settings.uiLang': 'App language',
  'settings.studyLang': 'Language you study',
  'settings.studyLangHint': "The language on the front of your cards. Changing it doesn't touch your words; it only changes labels and examples.",
  'settings.speech': 'Pronunciation',
  'settings.speechHint': "Tap the speaker on a card to hear the word in your device's voice.",
  'settings.autoSpeak': 'Read cards aloud automatically',
  'settings.reminder': 'Daily reminder',
  'settings.reminderHint': 'At the time you pick, a notification tells you how many reviews you have that day.',
  'settings.reminderOn': 'Reminder on',
  'settings.reminderDenied': 'Notification permission was denied. You can allow notifications for Kelime Kartları in your phone settings.',
  'settings.backup': 'Backup',
  'settings.goal': 'Daily word goal',
  'settings.goalHint': 'Choose how many new words you want to add each day. The bar turns green when you reach it.',
  'settings.goalOff': 'Off',

  'goal.label': "Today's goal",
  'goal.done': 'Goal reached',

  'stats.title': 'Stats',
  'stats.open': 'Streak and stats',
  'stats.streakDays': ({ n }) => `${n}-day streak`,
  'stats.streakZero': 'Add a word or do a review today to start a streak.',
  'stats.streakSafe': "You're done for today; the streak lives on.",
  'stats.streakKeep': 'Add a word or do a review today to keep your streak.',
  'stats.week': 'Last 7 days · words added',
  'stats.weekSummary': ({ added, reviewed }) => `This week you added ${added} ${s(added, 'word', 'words')} and reviewed ${reviewed}.`,
  'stats.goalHint': 'Green days met your goal.',
  'stats.overall': 'Overall',
  'stats.total': 'words in total',
  'stats.mastered': 'in vault (5/5)',
  'stats.learning': 'still learning',
  'stats.accuracy': 'correct answers',
  'stats.pct': ({ n }) => `${n}%`,
  'stats.best': 'longest streak (days)',
  'stats.activeDays': 'days studied',

  'notif.dueTitle': ({ n }) => `${n} ${s(n, 'word is', 'words are')} waiting for you today`,
  'notif.dueBody': 'A few minutes of review makes them stick.',
  'notif.emptyTitle': 'Nothing to review today',
  'notif.emptyBody': 'How about adding a new word?',
  'notif.channel': 'Daily reminder',

  'backup.shareUnsupported': 'Sharing is not supported on this device.',
  'backup.saveDialog': 'Save backup',
  'backup.exportFailed': 'Backup failed',
  'backup.restoreTitle': 'Restore backup',
  'backup.restoreText': ({ now, next }) => `Your current ${now} words will be deleted and replaced by ${next} words from the backup.`,
  'backup.restoreOk': 'Restore',
  'backup.openFailed': "Couldn't open the file",
  'backup.readFailed': "Couldn't read the backup",
  'backup.exportTitle': 'Back up',
  'backup.exportText': ({ n, topics }) =>
    `${n} ${s(n, 'word', 'words')} and ${topics} ${s(topics, 'topic', 'topics')} are saved as a single .json file. From the menu you can send it to Drive, Files, email or WhatsApp.`,
  'backup.exportBtn': 'Save backup file',
  'backup.importTitle': 'Restore',
  'backup.importText': 'Pick a backup file you saved earlier. It replaces your current words.',
  'backup.importBtn': 'Choose backup file',
  'backup.pasteToggle': 'Old way: paste the text',
  'backup.pasteBtn': 'Restore from text',
  'backup.errJson': "The text isn't a valid backup. Make sure you copied all of it.",
  'backup.errNoCards': 'No card list found in the backup.',
  'backup.errBroken': 'Some cards in the backup are broken.',

  'lang.en': 'English',
  'lang.de': 'German',
  'lang.fr': 'French',
  'lang.es': 'Spanish',
  'lang.it': 'Italian',
  'lang.ru': 'Russian',
  'lang.ar': 'Arabic',
  'lang.ja': 'Japanese',
  'lang.ko': 'Korean',
};

const MONTHS = {
  tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const WEEKDAYS = {
  tr: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};
// Takvim başlığı, pazartesiden başlar
const WEEKDAYS_SHORT = {
  tr: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

const DICTS = { tr, en };

// Ayarlar ekranındaki seçenekler; etiket her zaman kendi dilinde yazılır
export const UI_LANGUAGES = [
  { key: 'tr', label: 'Türkçe' },
  { key: 'en', label: 'English' },
];

// İlk açılışta cihaz dili Türkçe değilse İngilizce başlar
export function deviceUiLang() {
  try {
    const loc = Intl.DateTimeFormat().resolvedOptions().locale || '';
    return loc.toLowerCase().startsWith('tr') ? 'tr' : 'en';
  } catch (e) {
    return 'tr';
  }
}

let current = 'tr';
export const setUiLang = (l) => {
  current = DICTS[l] ? l : 'tr';
};
export const getUiLang = () => current;

export function t(key, params) {
  const v = DICTS[current][key] ?? tr[key] ?? key;
  return typeof v === 'function' ? v(params || {}) : v;
}

export const months = () => MONTHS[current];
export const weekdays = () => WEEKDAYS[current];
export const weekdaysShort = () => WEEKDAYS_SHORT[current];
// Sıralama ve aramada kullanılacak yerel ayar
export const collator = () => (current === 'tr' ? 'tr' : 'en');
