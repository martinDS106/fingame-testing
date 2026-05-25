import { useEffect, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { router } from 'expo-router';

import { ScreenHeader } from '@/components/ScreenHeader';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { useFintokStore, useUserStore } from '@/stores';
import { useLocaleStore } from '@/stores/useLocaleStore';

export default function FinTokSavedScreen() {
  const { rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const remoteUserId = useUserStore((s) => s.remoteUserId);
  const refresh = useFintokStore((s) => s.refresh);
  const videos = useFintokStore((s) => s.videos);
  const savedIds = useFintokStore((s) => s.savedIds);
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    void refresh(remoteUserId);
  }, [refresh, remoteUserId]);

  const savedVideos = useMemo(() => {
    const set = new Set(savedIds);
    return videos.filter((v) => set.has(v.id));
  }, [videos, savedIds]);

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader title="Saved FinTok" showBack />

      <ScrollView
        className="flex-1"
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 100, gap: 12 })}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8, marginBottom: 8 })}>
            <Bookmark size={18} color={colors.primary[700]} />
            <Text className="text-gray-900 font-semibold" style={ta}>
              Saved
            </Text>
          </View>
          {!remoteUserId && (
            <Text className="text-sm text-gray-700" style={ta}>
              Sign in to use Saved videos.
            </Text>
          )}
          {remoteUserId && savedVideos.length === 0 && (
            <Text className="text-sm text-gray-700" style={ta}>
              No saved videos yet.
            </Text>
          )}
        </Card>

        {savedVideos.map((v) => {
          const title = locale === 'ar' ? v.title_ar || v.title : v.title;
          const caption = locale === 'ar' ? v.caption_ar || v.caption : v.caption;
          return (
            <Card key={v.id}>
              <Text className="text-gray-900 font-semibold" numberOfLines={1} style={ta}>
                {title}
              </Text>
              {!!caption && (
                <Text className="text-sm text-gray-700 mt-1" numberOfLines={2} style={ta}>
                  {caption}
                </Text>
              )}
              <View className="mt-3">
                <Button
                  variant="outline"
                  fullWidth
                  onPress={() =>
                    router.push((`/fintok?startId=${v.id}` as unknown) as never)
                  }
                >
                  Open in FinTok
                </Button>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      <BottomNav />
    </View>
  );
}
