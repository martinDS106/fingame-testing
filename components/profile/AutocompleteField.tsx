import { useMemo, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Check, Search } from 'lucide-react-native';

import { useT } from '@/hooks/useT';
import { filterOptions } from '@/lib/egyptSchools';
import { rtlRowMerge, rtlTextStyle } from '@/lib/rtlStyle';

function highlightParts(text: string, query: string): { text: string; match: boolean }[] {
  const q = query.trim();
  if (!q) return [{ text, match: false }];
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q.toLowerCase());
  if (idx < 0) return [{ text, match: false }];
  const parts: { text: string; match: boolean }[] = [];
  if (idx > 0) parts.push({ text: text.slice(0, idx), match: false });
  parts.push({ text: text.slice(idx, idx + q.length), match: true });
  if (idx + q.length < text.length) {
    parts.push({ text: text.slice(idx + q.length), match: false });
  }
  return parts;
}

type AutocompleteFieldProps = {
  rtl: boolean;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
  limit?: number;
  complete?: boolean;
  onBlurField?: () => void;
  onFocusField?: () => void;
};

export function AutocompleteField({
  rtl,
  label,
  value,
  onChange,
  options,
  placeholder,
  limit = 15,
  complete = false,
  onBlurField,
  onFocusField,
}: AutocompleteFieldProps) {
  const { t } = useT();
  const ta = rtlTextStyle(rtl);
  const inputRef = useRef<TextInput>(null);
  const pickingRef = useRef(false);
  const [focused, setFocused] = useState(false);
  const [editing, setEditing] = useState(false);

  const suggestions = useMemo(
    () => filterOptions(value, options, limit),
    [value, options, limit],
  );

  const showDropdown =
    focused && editing && value.trim().length > 0 && suggestions.length > 0;

  const handleChange = (text: string) => {
    onChange(text);
    setEditing(true);
    setFocused(true);
  };

  const handleSelect = (item: string) => {
    onChange(item);
    setEditing(false);
    pickingRef.current = false;
    inputRef.current?.focus();
    setFocused(true);
    onBlurField?.();
  };

  return (
    <View>
      <TextInput
        ref={inputRef}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder ?? label}
        onFocus={() => {
          setFocused(true);
          setEditing(true);
          onFocusField?.();
        }}
        onBlur={() => {
          setTimeout(() => {
            if (!pickingRef.current) {
              setFocused(false);
              setEditing(false);
              onBlurField?.();
            }
            pickingRef.current = false;
          }, 120);
        }}
          style={{
            borderWidth: 1.5,
            borderColor: complete ? '#86efac' : focused ? '#60a5fa' : '#e5e7eb',
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
            color: '#111827',
            backgroundColor: complete ? '#f0fdf4' : '#fff',
            textAlign: rtl ? 'right' : 'left',
            writingDirection: rtl ? 'rtl' : 'ltr',
          }}
      />

      {showDropdown ? (
        <View
          style={{
            marginTop: 8,
            borderRadius: 14,
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#dbeafe',
            overflow: 'hidden',
            shadowColor: '#1e3a8a',
            shadowOpacity: 0.1,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          }}
        >
          <View
            style={rtlRowMerge(rtl, {
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 14,
              paddingVertical: 10,
              backgroundColor: '#eff6ff',
              borderBottomWidth: 1,
              borderBottomColor: '#dbeafe',
            })}
          >
            <Search size={15} color="#3b82f6" />
            <Text style={[ta, { flex: 1, fontSize: 12, fontWeight: '600', color: '#1d4ed8' }]}>
              {t('profile.resultsCount', { count: suggestions.length })}
            </Text>
          </View>

          {suggestions.map((item, index) => {
            const parts = highlightParts(item, value);
            const selected = value === item;
            return (
              <Pressable
                key={`${item}-${index}`}
                onPressIn={() => {
                  pickingRef.current = true;
                }}
                onPress={() => handleSelect(item)}
                style={({ pressed }) => ({
                  flexDirection: rtl ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 13,
                  gap: 10,
                  backgroundColor: pressed ? '#dbeafe' : selected ? '#eff6ff' : '#fff',
                  borderBottomWidth: index < suggestions.length - 1 ? 1 : 0,
                  borderBottomColor: '#f1f5f9',
                })}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: selected ? '#2563eb' : '#cbd5e1',
                  }}
                />
                <Text style={[ta, { flex: 1, fontSize: 15, lineHeight: 21, color: '#0f172a' }]}>
                  {parts.map((p, i) => (
                    <Text
                      key={`${i}-${p.text}`}
                      style={p.match ? { color: '#2563eb', fontWeight: '700' } : undefined}
                    >
                      {p.text}
                    </Text>
                  ))}
                </Text>
                {selected ? <Check size={16} color="#2563eb" strokeWidth={2.5} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
