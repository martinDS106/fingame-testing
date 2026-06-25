import { Modal, Pressable, Text, View } from 'react-native';
import { X } from 'lucide-react-native';

import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { AVATAR_PRESETS } from '@/lib/avatarPresets';
import { rtlRowMerge, rtlTextStyle } from '@/lib/rtlStyle';
import { colors } from '@/theme';
import { useT } from '@/hooks/useT';

type AvatarPickerModalProps = {
  visible: boolean;
  rtl: boolean;
  selected: string;
  title: string;
  onClose: () => void;
  onSelect: (avatarId: string) => void;
};

export function AvatarPickerModal({
  visible,
  rtl,
  selected,
  title,
  onClose,
  onSelect,
}: AvatarPickerModalProps) {
  const { t } = useT();
  const ta = rtlTextStyle(rtl);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-white rounded-t-3xl p-5 pb-8">
            <View
              style={rtlRowMerge(rtl, {
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              })}
            >
              <Text className="text-xl text-gray-900 font-bold" style={ta}>
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
              >
                <X size={18} color={colors.gray[700]} />
              </Pressable>
            </View>

            <View style={[rtlRowMerge(rtl, { flexWrap: 'wrap', gap: 12, justifyContent: 'center' })]}>
              {AVATAR_PRESETS.map((preset) => {
                const active = selected === preset.id;
                return (
                  <Pressable
                    key={preset.id}
                    onPress={() => {
                      onSelect(preset.id);
                      onClose();
                    }}
                    style={{ alignItems: 'center', width: 72, gap: 6 }}
                  >
                    <View
                      style={{
                        borderWidth: active ? 2 : 1,
                        borderColor: active ? '#2563eb' : '#e5e7eb',
                        borderRadius: 999,
                        padding: 3,
                      }}
                    >
                      <ProfileAvatar avatar={preset.id} size={52} />
                    </View>
                    <Text
                      style={[ta, { fontSize: 11, color: active ? '#1d4ed8' : '#6b7280' }]}
                      numberOfLines={1}
                    >
                      {t(preset.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
