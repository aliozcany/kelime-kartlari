// Renkler global.css'teki CSS değişkenlerinden gelir (açık / koyu tema).
const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.js', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: c('background'),
        foreground: c('foreground'),
        card: c('card'),
        muted: { DEFAULT: c('muted'), foreground: c('muted-foreground') },
        border: c('border'),
        input: c('input'),
        primary: { DEFAULT: c('primary'), foreground: c('primary-foreground') },
        accent: { DEFAULT: c('accent'), soft: c('accent-soft') },
        danger: { DEFAULT: c('danger'), soft: c('danger-soft') },
        highlight: { DEFAULT: c('highlight'), foreground: c('highlight-foreground') },
        hint: { DEFAULT: c('hint'), foreground: c('hint-foreground') },
      },
      // Android'de özel fontlarda fontWeight çalışmaz; her kalınlık ayrı bir aile.
      fontFamily: {
        sans: ['InstrumentSans_400Regular'],
        'sans-md': ['InstrumentSans_500Medium'],
        'sans-sb': ['InstrumentSans_600SemiBold'],
        'sans-b': ['InstrumentSans_700Bold'],
        serif: ['Newsreader_500Medium'],
        'serif-sb': ['Newsreader_600SemiBold'],
        'serif-i': ['Newsreader_400Regular_Italic'],
      },
    },
  },
  plugins: [],
};
