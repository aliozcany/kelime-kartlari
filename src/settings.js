import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';
import { deviceUiLang, setUiLang, t } from './i18n';

const KEY = 'kelime-kartlari:settings:v1';

// Çalışılan dil. Kartlardaki alan adı geriye dönük uyum için hâlâ `en`;
// arayüzdeki etiket, örnek yer tutucular, sıralama ve telaffuz sesi buradan gelir.
// Etiket arayüz diline göre t(`lang.${key}`) ile alınır; meaningEn İngilizce arayüzdeki yer tutucudur.
export const LANGUAGES = [
  { key: 'en', speech: 'en-US', meaningEn: 'unwilling, hesitant', sample: { word: 'reluctant', meaning: 'isteksiz, gönülsüz', example: 'She was reluctant to leave the party.', syn: 'unwilling', ant: 'eager' } },
  { key: 'de', speech: 'de-DE', meaningEn: 'hesitant, reluctant', sample: { word: 'zögerlich', meaning: 'tereddütlü, çekingen', example: 'Er antwortete zögerlich.', syn: 'unschlüssig', ant: 'entschlossen' } },
  { key: 'fr', speech: 'fr-FR', meaningEn: 'reluctant, reserved', sample: { word: 'réticent', meaning: 'isteksiz, çekingen', example: 'Il était réticent à partir.', syn: 'hésitant', ant: 'enthousiaste' } },
  { key: 'es', speech: 'es-ES', meaningEn: 'reluctant, unwilling', sample: { word: 'reacio', meaning: 'isteksiz, gönülsüz', example: 'Estaba reacio a salir de la fiesta.', syn: 'renuente', ant: 'dispuesto' } },
  { key: 'it', speech: 'it-IT', meaningEn: 'reluctant, unwilling', sample: { word: 'riluttante', meaning: 'isteksiz, gönülsüz', example: 'Era riluttante a partire.', syn: 'restio', ant: 'desideroso' } },
  { key: 'ru', speech: 'ru-RU', meaningEn: 'reluctantly', sample: { word: 'неохотно', meaning: 'isteksizce', example: 'Он неохотно согласился.', syn: 'нехотя', ant: 'охотно' } },
  { key: 'ar', speech: 'ar-SA', meaningEn: 'hesitant', sample: { word: 'متردد', meaning: 'tereddütlü', example: 'كان مترددًا في الذهاب.', syn: 'حائر', ant: 'واثق' } },
  { key: 'ja', speech: 'ja-JP', meaningEn: 'to feel reluctant', sample: { word: '気が進まない', meaning: 'isteksiz olmak', example: '行くのは気が進まない。', syn: '', ant: '' } },
  { key: 'ko', speech: 'ko-KR', meaningEn: 'to be reluctant', sample: { word: '꺼리다', meaning: 'çekinmek, istememek', example: '그는 가기를 꺼렸다.', syn: '', ant: '' } },
];

export const THEMES = ['system', 'light', 'dark'];

// reminder: günlük hatırlatma bildirimi (saat yerel). autoSpeak: kart gelince kelimeyi oku.
const DEFAULTS = {
  theme: 'system',
  language: 'en',
  uiLang: null, // null → ilk açılışta cihaz dilinden seçilir
  autoSpeak: false,
  dailyGoal: 0, // günde eklenecek yeni kelime hedefi; 0 → kapalı
  reminder: { enabled: false, hour: 20, minute: 0 },
};

const Ctx = createContext({ ...DEFAULTS, lang: LANGUAGES[0], ready: false, set: () => {} });

function applyTheme(theme) {
  // Native'de Appearance.setColorScheme çağrılır; useColorScheme ve global.css'teki
  // prefers-color-scheme buna uyar. Web'de NativeWind 'media' modunda elle değiştirmeye izin vermez.
  try {
    colorScheme.set(theme);
  } catch (e) {}
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const s = { ...DEFAULTS, ...(raw ? JSON.parse(raw) : {}) };
        if (!s.uiLang) s.uiLang = deviceUiLang();
        setUiLang(s.uiLang);
        applyTheme(s.theme);
        setSettings(s);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const set = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      if (patch.theme) applyTheme(patch.theme);
      if (patch.uiLang) setUiLang(patch.uiLang);
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const base = LANGUAGES.find((l) => l.key === settings.language) || LANGUAGES[0];
  const isEn = settings.uiLang === 'en';
  const lang = {
    ...base,
    label: t(`lang.${base.key}`),
    sample: isEn ? { ...base.sample, meaning: base.meaningEn } : base.sample,
  };

  return <Ctx.Provider value={{ ...settings, lang, ready, set }}>{children}</Ctx.Provider>;
}

export const useSettings = () => useContext(Ctx);
