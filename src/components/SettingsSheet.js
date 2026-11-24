import React from 'react';
import { Pressable, View } from 'react-native';
import { Monitor, Moon, Sun } from 'lucide-react-native';
import { LANGUAGES, THEMES, useSettings } from '../settings';
import { useColors } from '../theme';
import { cn } from '../lib/utils';
import Sheet from './Sheet';
import BackupSection from './BackupSection';
import { Chip } from './ui/chip';
import { Text } from './ui/text';

const THEME_ICONS = { system: Monitor, light: Sun, dark: Moon };

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

export default function SettingsSheet({ visible, onClose, cards, topics, onRestore }) {
  const colors = useColors();
  const { theme, language, set } = useSettings();

  return (
    <Sheet visible={visible} title="Ayarlar" onClose={onClose}>
      <View className="gap-7">
        <Section title="Görünüm">
          <View className="flex-row rounded-xl bg-muted p-1">
            {THEMES.map((t) => {
              const active = theme === t.key;
              const Icon = THEME_ICONS[t.key];
              return (
                <Pressable
                  key={t.key}
                  onPress={() => set({ theme: t.key })}
                  className={cn('h-10 flex-1 flex-row items-center justify-center gap-1.5 rounded-lg', active && 'bg-card')}
                >
                  <Icon size={15} color={active ? colors.foreground : colors.mutedForeground} />
                  <Text className={cn('text-sm', active ? 'font-sans-sb text-foreground' : 'font-sans-md text-muted-foreground')}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section
          title="Çalıştığın dil"
          hint="Kartların ön yüzündeki dil. Değiştirmek mevcut kelimelerine dokunmaz, sadece etiketleri ve örnekleri değiştirir."
        >
          <View className="flex-row flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <Chip key={l.key} label={l.label} active={language === l.key} onPress={() => set({ language: l.key })} />
            ))}
          </View>
        </Section>

        <Section title="Yedek">
          <BackupSection cards={cards} topics={topics} onRestore={onRestore} onDone={onClose} />
        </Section>
      </View>
    </Sheet>
  );
}
