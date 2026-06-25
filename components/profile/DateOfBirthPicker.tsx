import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { X } from 'lucide-react-native';

import { rtlRowMerge, rtlTextStyle } from '@/lib/rtlStyle';
import { colors } from '@/theme';

function parseIsoDate(iso: string | null | undefined): Date {
  if (iso) {
    const d = new Date(`${iso}T12:00:00`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const fallback = new Date();
  fallback.setFullYear(fallback.getFullYear() - 18);
  return fallback;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplay(iso: string | null | undefined, hint: string): string {
  if (!iso) return hint;
  const d = parseIsoDate(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

type DateOfBirthPickerProps = {
  rtl: boolean;
  value: string | null;
  label: string;
  hint: string;
  doneLabel: string;
  complete?: boolean;
  onBlurField?: () => void;
  onFocusField?: () => void;
  onChange: (iso: string | null) => void;
};

export function DateOfBirthPicker({
  rtl,
  value,
  label,
  hint,
  doneLabel,
  complete = false,
  onBlurField,
  onFocusField,
  onChange,
}: DateOfBirthPickerProps) {
  const ta = rtlTextStyle(rtl);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => parseIsoDate(value));

  const display = useMemo(() => formatDisplay(value, hint), [value, hint]);

  const openPicker = () => {
    setDraft(parseIsoDate(value));
    setOpen(true);
    onFocusField?.();
  };

  const finishPicker = () => {
    onBlurField?.();
  };

  const confirm = () => {
    onChange(toIsoDate(draft));
    setOpen(false);
    finishPicker();
  };

  const onPickerChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (selected) setDraft(selected);
    if (Platform.OS === 'android') {
      if (selected) onChange(toIsoDate(selected));
      setOpen(false);
      finishPicker();
    }
  };

  return (
    <View>
      <Pressable
        onPress={openPicker}
        style={{
          borderWidth: 1.5,
          borderColor: complete ? '#86efac' : '#e5e7eb',
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          backgroundColor: complete ? '#f0fdf4' : '#fff',
        }}
      >
        <Text style={[ta, { fontSize: 16, color: value ? '#111827' : '#9ca3af' }]}>
          {display}
        </Text>
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => {
          setOpen(false);
          finishPicker();
        }}>
          <Pressable
            className="flex-1 justify-end"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onPress={() => {
              setOpen(false);
              finishPicker();
            }}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="bg-white rounded-t-3xl p-5 pb-8">
                <View
                  style={rtlRowMerge(rtl, {
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  })}
                >
                  <Text className="text-lg text-gray-900 font-semibold" style={ta}>
                    {label}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setOpen(false);
                      finishPicker();
                    }}
                    hitSlop={12}
                    className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
                  >
                    <X size={18} color={colors.gray[700]} />
                  </Pressable>
                </View>

                <DateTimePicker
                  value={draft}
                  mode="date"
                  display="spinner"
                  onChange={onPickerChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1950, 0, 1)}
                  locale={rtl ? 'ar' : undefined}
                  style={{ alignSelf: 'stretch' }}
                />

                <Pressable
                  onPress={confirm}
                  style={{
                    marginTop: 12,
                    backgroundColor: '#2563eb',
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{doneLabel}</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : open ? (
        <DateTimePicker
          value={draft}
          mode="date"
          display="spinner"
          onChange={onPickerChange}
          maximumDate={new Date()}
          minimumDate={new Date(1950, 0, 1)}
        />
      ) : null}
    </View>
  );
}
