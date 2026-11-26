import React, { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { Minus, Monitor, Moon, Plus, Sun, Volume2 } from 'lucide-react-native';
import { LANGUAGES, THEMES, useSettings } from '../settings';
import { t, UI_LANGUAGES } from '../i18n';
import { ensurePermission, REMINDER_SUPPORTED } from '../reminder';
import { speak } from '../speech';
import { useColors } from '../theme';
import { cn } from '../lib/utils';
import Sheet from './Sheet';
import BackupSection from './BackupSection';
import { Chip } from './ui/chip';
import { Text } from './ui/text';

const THEME_ICONS = { system: Monitor, light: Sun, dark: Moon };
const STEP = 15; // hatırlatma saati 15 dakikalık adımlarla değişir

function Section({ title, hint, children }) {
  return (
    <View className="gap-2.5">
      <View>
        <Text variant="overline">{title}</Text>
        {hint ? <Text variant="muted" className="mt-1 leading-5">{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

// Gri zemin üzerinde eşit genişlikte seçenekler (tema, arayüz dili)
function Segmented({ options, value, onChange }) {
  const colors = useColors();
  return (
    <View className="flex-row rounded-xl bg-muted p-1">
      {options.map(({ key, label, Icon }) => {
        const active = value === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            className={cn('h-10 flex-1 flex-row items-center justify-center gap-1.5 rounded-lg', active && 'bg-card')}
          >
            {Icon ? <Icon size={15} color={active ? colors.foreground : colors.mutedForeground} /> : null}
            <Text className={cn('text-sm', active ? 'font-sans-sb text-foreground' : 'font-sans-md text-muted-foreground')}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SwitchRow({ label, value, onChange }) {
  const colors = useColors();
  return (
    <View className="flex-row items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
      <Text className="flex-1 pr-3 font-sans-md text-[15px]">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.muted, true: colors.accent }}
        thumbColor={value ? colors.primaryForeground : colors.mutedForeground}
        ios_backgroundColor={colors.muted}
      />
    </View>
  );
}

const pad = (n) => String(n).padStart(2, '0');

export default function SettingsSheet({ visible, onClose, cards, topics, onRestore }) {
  const colors = useColors();
  const { theme, language, uiLang, autoSpeak, reminder, lang, set } = useSettings();
  const [denied, setDenied] = useState(false);

  const toggleReminder = async (on) => {
    if (!on) {
      set({ reminder: { ...reminder, enabled: false } });
      return;
    }
    const ok = await ensurePermission();
    setDenied(!ok);
    if (ok) set({ reminder: { ...reminder, enabled: true } });
  };

  const shiftTime = (dir) => {
    const total = (reminder.hour * 60 + reminder.minute + dir * STEP + 24 * 60) % (24 * 60);
    set({ reminder: { ...reminder, hour: Math.floor(total / 60), minute: total % 60 } });
  };

  return (
    <Sheet visible={visible} title={t('settings.title')} onClose={onClose}>
      <View className="gap-7">
        <Section title={t('settings.appearance')}>
          <Segmented
            options={THEMES.map((k) => ({ key: k, label: t(`settings.theme.${k}`), Icon: THEME_ICONS[k] }))}
            value={theme}
            onChange={(k) => set({ theme: k })}
          />
        </Section>

        <Section title={t('settings.uiLang')}>
          <Segmented options={UI_LANGUAGES} value={uiLang} onChange={(k) => set({ uiLang: k })} />
        </Section>

        <Section title={t('settings.studyLang')} hint={t('settings.studyLangHint')}>
          <View className="flex-row flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <Chip key={l.key} label={t(`lang.${l.key}`)} active={language === l.key} onPress={() => set({ language: l.key })} />
            ))}
          </View>
        </Section>

        <Section title={t('settings.speech')} hint={t('settings.speechHint')}>
          <SwitchRow label={t('settings.autoSpeak')} value={autoSpeak} onChange={(v) => set({ autoSpeak: v })} />
          <Pressable
            onPress={() => speak(lang.sample.word, lang)}
            className="flex-row items-center gap-2 self-start rounded-full bg-muted px-3.5 py-2 active:opacity-70"
          >
            <Volume2 size={15} color={colors.foreground} />
            <Text className="font-sans-md text-sm">
              {t('common.listen')}: <Text className="font-serif text-[15px]">{lang.sample.word}</Text>
            </Text>
          </Pressable>
        </Section>

        {REMINDER_SUPPORTED ? (
          <Section title={t('settings.reminder')} hint={t('settings.reminderHint')}>
            <SwitchRow label={t('settings.reminderOn')} value={reminder.enabled} onChange={toggleReminder} />
            {reminder.enabled ? (
              <View className="flex-row items-center justify-center gap-5 rounded-2xl border border-border bg-card py-3">
                <Pressable onPress={() => shiftTime(-1)} hitSlop={10} className="h-10 w-10 items-center justify-center rounded-full bg-muted active:opacity-60">
                  <Minus size={18} color={colors.foreground} />
                </Pressable>
                <Text className="w-[110px] text-center font-serif text-[34px]" style={{ fontVariant: ['tabular-nums'] }}>
                  {pad(reminder.hour)}:{pad(reminder.minute)}
                </Text>
                <Pressable onPress={() => shiftTime(1)} hitSlop={10} className="h-10 w-10 items-center justify-center rounded-full bg-muted active:opacity-60">
                  <Plus size={18} color={colors.foreground} />
                </Pressable>
              </View>
            ) : null}
            {denied ? <Text className="text-sm leading-5 text-danger">{t('settings.reminderDenied')}</Text> : null}
          </Section>
        ) : null}

        <Section title={t('settings.backup')}>
          <BackupSection cards={cards} topics={topics} onRestore={onRestore} onDone={onClose} />
        </Section>
      </View>
    </Sheet>
  );
}
