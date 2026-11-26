import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button } from '../components/ui/button';
import { Text } from '../components/ui/text';
import { t } from '../i18n';


export const PAGE_SIZE = 30;

// Uzun listeleri parça parça çizer: önce PAGE_SIZE kadar, liste sonuna gelindikçe bir sayfa daha.
// resetKey değişince (filtre, arama, görünüm) baştan başlar.
export function usePaged(items, resetKey, pageSize = PAGE_SIZE) {
  const [count, setCount] = useState(pageSize);
  useEffect(() => setCount(pageSize), [resetKey, pageSize]);

  const visible = useMemo(() => items.slice(0, count), [items, count]);
  const hasMore = count < items.length;
  const loadMore = useCallback(() => {
    setCount((c) => (c < items.length ? c + pageSize : c));
  }, [items.length, pageSize]);

  return { visible, hasMore, loadMore, total: items.length };
}

// FlatList / SectionList için alt bilgi: kalan varsa "daha fazla" butonu
export function PagedFooter({ paged, children }) {
  if (!paged.hasMore) return children || null;
  return (
    <View className="mt-4 items-center gap-2">
      <Text variant="small">
        {t('paged.showing', { shown: paged.visible.length, total: paged.total })}
      </Text>
      <Button variant="outline" size="sm" onPress={paged.loadMore}>
        <Text>{t('paged.more')}</Text>
      </Button>
    </View>
  );
}

// onEndReached ile birlikte verilecek ortak ayarlar
export const pagedListProps = (paged) => ({
  onEndReached: paged.hasMore ? paged.loadMore : undefined,
  onEndReachedThreshold: 0.5,
  initialNumToRender: 15,
  windowSize: 9,
});
