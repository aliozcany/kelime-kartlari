import { useColorScheme } from 'react-native';

// className kullanılamayan yerler için (ikon rengi, placeholder, ActivityIndicator…).
// global.css içindeki değişkenlerle aynı tutulmalı.
export const COLORS = {
  light: {
    background: '#F4F1EA',
    foreground: '#1C1B18',
    card: '#FFFDF8',
    muted: '#EAE5DA',
    mutedForeground: '#706B61',
    border: '#E0DACD',
    placeholder: '#A9A397',
    primary: '#1C1B18',
    primaryForeground: '#FAF8F2',
    accent: '#2E5E4A',
    danger: '#B2452C',
    highlightForeground: '#4A3C0A',
  },
  dark: {
    background: '#161513',
    foreground: '#ECE7DB',
    card: '#1F1E1B',
    muted: '#2A2824',
    mutedForeground: '#A09A8E',
    border: '#34322D',
    placeholder: '#6E695F',
    primary: '#ECE7DB',
    primaryForeground: '#161513',
    accent: '#7CB898',
    danger: '#E87C62',
    highlightForeground: '#221C06',
  },
};

export function useColors() {
  return COLORS[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
