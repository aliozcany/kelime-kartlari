import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useColors } from '../theme';
import { makeBackup, parseBackup } from '../backup';
import { todayStr } from '../dates';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Text } from './ui/text';
import { t } from '../i18n';


// Ayarlar ekranındaki yedek bölümü: dışa aktar / geri yükle
export default function BackupSection({ onDone, cards, topics, onRestore }) {
  const [text, setText] = useState('');
  const [pasteOpen, setPasteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const colors = useColors();

  // Yedeği .json dosyası olarak oluşturup paylaş menüsünü açar (Drive, Dosyalar, WhatsApp, e-posta…)
  const exportFile = async () => {
    setBusy(true);
    try {
      const file = new File(Paths.cache, `kelime-kartlari-${todayStr()}.json`);
      if (file.exists) file.delete();
      file.create();
      file.write(makeBackup(cards, topics));
      if (!(await Sharing.isAvailableAsync())) throw new Error(t('backup.shareUnsupported'));
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: t('backup.saveDialog'),
        UTI: 'public.json',
      });
    } catch (e) {
      Alert.alert(t('backup.exportFailed'), String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const confirmRestore = (data, after) => {
    Alert.alert(
      t('backup.restoreTitle'),
      t('backup.restoreText', { now: cards.length, next: data.cards.length }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('backup.restoreOk'),
          style: 'destructive',
          onPress: () => {
            onRestore(data);
            after?.();
            onDone?.();
          },
        },
      ]
    );
  };

  const importFile = async () => {
    let content;
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.length) return;
      content = await new File(res.assets[0].uri).text();
    } catch (e) {
      Alert.alert(t('backup.openFailed'), String(e?.message || e));
      return;
    }
    try {
      confirmRestore(parseBackup(content));
    } catch (e) {
      Alert.alert(t('backup.readFailed'), e.message);
    }
  };

  const restoreText = () => {
    try {
      confirmRestore(parseBackup(text), () => setText(''));
    } catch (e) {
      Alert.alert(t('backup.readFailed'), e.message);
    }
  };

  return (
    <View className="gap-4">
      <View className="rounded-2xl border border-border bg-card p-4">
        <Text variant="heading">{t('backup.exportTitle')}</Text>
        <Text variant="muted" className="mt-1 leading-5">
          {t('backup.exportText', { n: cards.length, topics: topics.length })}
        </Text>
        <Button className="mt-4" onPress={exportFile} disabled={busy}>
          <Text>{t('backup.exportBtn')}</Text>
        </Button>
      </View>

      <View className="rounded-2xl border border-border bg-card p-4">
        <Text variant="heading">{t('backup.importTitle')}</Text>
        <Text variant="muted" className="mt-1 leading-5">
          {t('backup.importText')}
        </Text>
        <Button variant="danger" className="mt-4" onPress={importFile}>
          <Text>{t('backup.importBtn')}</Text>
        </Button>

        <Pressable onPress={() => setPasteOpen(!pasteOpen)} hitSlop={8} className="mt-4 flex-row items-center gap-1">
          {pasteOpen ? (
            <ChevronDown size={15} color={colors.mutedForeground} />
          ) : (
            <ChevronRight size={15} color={colors.mutedForeground} />
          )}
          <Text variant="label">{t('backup.pasteToggle')}</Text>
        </Pressable>
        {pasteOpen ? (
          <>
            <Input
              className="mt-3 max-h-[180px] bg-background text-[13px]"
              value={text}
              onChangeText={setText}
              placeholder='{"app":"kelime-kartlari", ...}'
              multiline
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button variant="danger" className="mt-3" onPress={restoreText} disabled={!text.trim()}>
              <Text>{t('backup.pasteBtn')}</Text>
            </Button>
          </>
        ) : null}
      </View>
    </View>
  );
}
