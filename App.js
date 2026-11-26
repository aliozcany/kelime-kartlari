import './src/lib/interop';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
// Fontlar tek tek alınır; paketin ana girişi bütün kalınlıkları uygulamaya gömer
import { InstrumentSans_400Regular } from '@expo-google-fonts/instrument-sans/400Regular';
import { InstrumentSans_500Medium } from '@expo-google-fonts/instrument-sans/500Medium';
import { InstrumentSans_600SemiBold } from '@expo-google-fonts/instrument-sans/600SemiBold';
import { InstrumentSans_700Bold } from '@expo-google-fonts/instrument-sans/700Bold';
import { Newsreader_400Regular_Italic } from '@expo-google-fonts/newsreader/400Regular_Italic';
import { Newsreader_500Medium } from '@expo-google-fonts/newsreader/500Medium';
import { Newsreader_600SemiBold } from '@expo-google-fonts/newsreader/600SemiBold';
import { BookOpen, Library, Plus, Settings, Target, Trophy } from 'lucide-react-native';

import { useColors } from './src/theme';
import { cn } from './src/lib/utils';
import * as db from './src/storage';
import { formatDay, isDue, todayStr } from './src/dates';
import StudyScreen from './src/screens/StudyScreen';
import AddScreen from './src/screens/AddScreen';
import ListScreen from './src/screens/ListScreen';
import HardScreen from './src/screens/HardScreen';
import VaultScreen from './src/screens/VaultScreen';
import SettingsSheet from './src/components/SettingsSheet';
import { SettingsProvider, useSettings } from './src/settings';
import { t } from './src/i18n';
import { scheduleReminders } from './src/reminder';
import { Button } from './src/components/ui/button';
import { Text } from './src/components/ui/text';

// Etiket ve başlık arayüz dilinden gelir: tabs.<key>, title.<key>
const TABS = [
  { key: 'list', Icon: Library },
  { key: 'vault', Icon: Trophy },
  { key: 'study', Icon: BookOpen },
  { key: 'add', Icon: Plus },
  { key: 'hard', Icon: Target },
];

export default function App() {
  return (
    <SettingsProvider>
      <Main />
    </SettingsProvider>
  );
}

function Main() {
  const { ready, reminder, uiLang } = useSettings();
  const scheme = useColorScheme();
  const colors = useColors();
  const [fontsLoaded] = useFonts({
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
    Newsreader_400Regular_Italic,
    Newsreader_500Medium,
    Newsreader_600SemiBold,
  });
  const [cards, setCards] = useState(null);
  const [topics, setTopics] = useState([]);
  const [tab, setTab] = useState('study');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tick, setTick] = useState(0); // gün değişince ekranı tazelemek için

  useEffect(() => {
    db.loadAll().then(({ cards: cs, topics: ts }) => {
      setTopics(ts);
      setCards(cs);
    });
    const sub = AppState.addEventListener('change', (s) => s === 'active' && setTick((t) => t + 1));
    return () => sub.remove();
  }, []);

  // Hatırlatma bildirimleri kartlara göre yeniden kurulur (art arda değişikliklerde bir kez)
  useEffect(() => {
    if (!cards || !ready) return;
    const id = setTimeout(() => scheduleReminders(cards, reminder), 1500);
    return () => clearTimeout(id);
  }, [cards, ready, reminder, uiLang, tick]);

  // Ekrandaki liste hemen güncellenir; veritabanına yalnızca değişen kart yazılır
  const addCard = (card) => {
    setCards((cs) => [...cs, card]);
    db.saveCard(card);
  };
  const updateCard = (card) => {
    setCards((cs) => cs.map((c) => (c.id === card.id ? card : c)));
    db.saveCard(card);
  };
  const deleteCard = (id) => {
    setCards((cs) => cs.filter((c) => c.id !== id));
    db.deleteCard(id);
  };

  const addTopic = (name) => {
    if (topics.some((t) => t.toLowerCase() === name.toLowerCase())) return;
    setTopics((ts) => [...ts, name].sort((a, b) => a.localeCompare(b, 'tr')));
    db.saveTopic(name);
  };
  // Konu silinince kartlar silinmez, sadece konuları boşaltılır
  const removeTopic = (name) => {
    setTopics((ts) => ts.filter((t) => t !== name));
    setCards((cs) => cs.map((c) => (c.topic === name ? { ...c, topic: null } : c)));
    db.deleteTopic(name);
  };

  const restore = (data) => {
    setCards(data.cards);
    setTopics(data.topics);
    db.replaceAll(data);
  };

  const topicProps = { topics, onAddTopic: addTopic, onRemoveTopic: removeTopic };

  if (!cards || !fontsLoaded || !ready) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.foreground} />
      </View>
    );
  }

  const today = todayStr();
  const dueCount = cards.filter((c) => isDue(c, today)).length;
  const todayCount = cards.filter((c) => c.createdAt === today).length;
  const current = TABS.find((t) => t.key === tab);

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <View className="flex-row items-end px-5 pb-3 pt-3">
            <View className="flex-1">
              <Text variant="overline">{formatDay(today)}</Text>
              <Text variant="title" className="mt-1">{t(`title.${current.key}`)}</Text>
              <Text variant="muted" className="mt-0.5">
                {t('header.summary', { n: cards.length, due: dueCount })}
              </Text>
            </View>
            <Button variant="outline" size="icon" onPress={() => setSettingsOpen(true)} className="mb-0.5" accessibilityLabel={t('header.settings')}>
              <Settings size={19} color={colors.foreground} />
            </Button>
          </View>

          <View className="flex-1">
            {tab === 'study' && <StudyScreen cards={cards} onUpdate={updateCard} {...topicProps} />}
            {tab === 'add' && <AddScreen cards={cards} onAdd={addCard} todayCount={todayCount} {...topicProps} />}
            {tab === 'list' && <ListScreen cards={cards} onUpdate={updateCard} onDelete={deleteCard} {...topicProps} />}
            {tab === 'hard' && <HardScreen cards={cards} onUpdate={updateCard} {...topicProps} />}
            {tab === 'vault' && <VaultScreen cards={cards} onUpdate={updateCard} {...topicProps} />}
          </View>

          <SettingsSheet
            visible={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            cards={cards}
            topics={topics}
            onRestore={restore}
          />

          <View className="flex-row border-t border-border bg-background px-1 pb-1 pt-2">
            {TABS.map(({ key, Icon }) => {
              const active = tab === key;
              return (
                <Pressable key={key} onPress={() => setTab(key)} className="flex-1 items-center gap-1 py-1" role="tab">
                  <View>
                    <Icon size={22} strokeWidth={active ? 2.2 : 1.7} color={active ? colors.foreground : colors.mutedForeground} />
                    {key === 'study' && dueCount > 0 ? (
                      <View className="absolute -right-3 -top-1.5 h-[17px] min-w-[17px] items-center justify-center rounded-full bg-danger px-1">
                        <Text className="font-sans-sb text-[10px] text-primary-foreground">{dueCount}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    className={cn('text-[10px] tracking-tight', active ? 'font-sans-sb text-foreground' : 'font-sans-md text-muted-foreground')}>
                    {t(`tabs.${key}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SafeAreaView>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
