import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';

const KEY = 'kelime-kartlari:settings:v1';

// Çalışılan dil. Kartlardaki alan adı geriye dönük uyum için hâlâ `en`;
// arayüzdeki etiket, örnek yer tutucular ve sıralama buradan gelir.
export const LANGUAGES = [
  { key: 'en', label: 'İngilizce', sample: { word: 'reluctant', meaning: 'isteksiz, gönülsüz', example: 'She was reluctant to leave the party.', syn: 'unwilling', ant: 'eager' } },
  { key: 'de', label: 'Almanca', sample: { word: 'zögerlich', meaning: 'tereddütlü, çekingen', example: 'Er antwortete zögerlich.', syn: 'unschlüssig', ant: 'entschlossen' } },
  { key: 'fr', label: 'Fransızca', sample: { word: 'réticent', meaning: 'isteksiz, çekingen', example: 'Il était réticent à partir.', syn: 'hésitant', ant: 'enthousiaste' } },
  { key: 'es', label: 'İspanyolca', sample: { word: 'reacio', meaning: 'isteksiz, gönülsüz', example: 'Estaba reacio a salir de la fiesta.', syn: 'renuente', ant: 'dispuesto' } },
  { key: 'it', label: 'İtalyanca', sample: { word: 'riluttante', meaning: 'isteksiz, gönülsüz', example: 'Era riluttante a partire.', syn: 'restio', ant: 'desideroso' } },
  { key: 'ru', label: 'Rusça', sample: { word: 'неохотно', meaning: 'isteksizce', example: 'Он неохотно согласился.', syn: 'нехотя', ant: 'охотно' } },
  { key: 'ar', label: 'Arapça', sample: { word: 'متردد', meaning: 'tereddütlü', example: 'كان مترددًا في الذهاب.', syn: 'حائر', ant: 'واثق' } },
  { key: 'ja', label: 'Japonca', sample: { word: '気が進まない', meaning: 'isteksiz olmak', example: '行くのは気が進まない。', syn: '', ant: '' } },
  { key: 'ko', label: 'Korece', sample: { word: '꺼리다', meaning: 'çekinmek, istememek', example: '그는 가기를 꺼렸다.', syn: '', ant: '' } },
];

export const THEMES = [
  { key: 'system', label: 'Sistem' },
  { key: 'light', label: 'Açık' },
  { key: 'dark', label: 'Koyu' },
];

const DEFAULTS = { theme: 'system', language: 'en' };

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
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const lang = LANGUAGES.find((l) => l.key === settings.language) || LANGUAGES[0];

  return <Ctx.Provider value={{ ...settings, lang, ready, set }}>{children}</Ctx.Provider>;
}

export const useSettings = () => useContext(Ctx);
