import { Pressable, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import type { AdminUserDraft } from '@/lib/adminUserDraft';
import type { RemoteProfile } from '@/lib/syncServiceApi';
import { rtlRowMerge, rtlTextStyle } from '@/lib/rtlStyle';

type AdminUserEditFormProps = {
  rtl: boolean;
  editing: RemoteProfile;
  draft: AdminUserDraft;
  onChange: (patch: Partial<AdminUserDraft>) => void;
  onPickAvatar: () => void;
};

function Field({
  label,
  value,
  onChangeText,
  rtl,
  hint,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  rtl: boolean;
  hint?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}) {
  const ta = rtlTextStyle(rtl);
  return (
    <Card className="border border-gray-200" padded>
      <Text className="text-xs text-gray-500 mb-1" style={ta}>
        {label}
      </Text>
      {hint ? (
        <Text className="text-xs text-gray-400 mb-1" style={ta}>
          {hint}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
        className="px-3 py-2 rounded-lg border border-gray-200"
        style={ta}
      />
    </Card>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  rtl,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  rtl: boolean;
}) {
  const ta = rtlTextStyle(rtl);
  return (
    <Card className="border border-gray-200" padded>
      <Text className="text-xs text-gray-500 mb-2" style={ta}>
        {label}
      </Text>
      <View style={rtlRowMerge(rtl, { gap: 8 })}>
        <Button size="sm" variant={value ? 'primary' : 'outline'} onPress={() => onChange(true)}>
          Yes
        </Button>
        <Button size="sm" variant={!value ? 'primary' : 'outline'} onPress={() => onChange(false)}>
          No
        </Button>
      </View>
    </Card>
  );
}

export function AdminUserEditForm({
  rtl,
  editing,
  draft,
  onChange,
  onPickAvatar,
}: AdminUserEditFormProps) {
  const ta = rtlTextStyle(rtl);
  const set = (patch: Partial<AdminUserDraft>) => onChange(patch);

  return (
    <View className="gap-2">
      <Card className="border border-gray-200" padded>
        <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 12 })}>
          <ProfileAvatar avatar={draft.avatar || 'default'} size={52} />
          <View className="flex-1">
            <Text className="text-gray-900 font-semibold" style={ta}>
              {draft.displayName || editing.display_name}
            </Text>
            <Text className="text-xs text-gray-500" style={ta}>
              {editing.email ?? editing.id}
            </Text>
            <Text className="text-xs text-gray-400 mt-1" style={ta}>
              Referral code: {editing.referral_code ?? '—'}
            </Text>
          </View>
        </View>
      </Card>

      <Text className="text-sm text-gray-800 font-semibold" style={ta}>
        Account
      </Text>
      <Field label="Display name" value={draft.displayName} onChangeText={(v) => set({ displayName: v })} rtl={rtl} />
      <Card className="border border-gray-200" padded>
        <Text className="text-xs text-gray-500 mb-2" style={ta}>
          Avatar
        </Text>
        <Pressable onPress={onPickAvatar} style={rtlRowMerge(rtl, { alignItems: 'center', gap: 12 })}>
          <ProfileAvatar avatar={draft.avatar || 'default'} size={44} />
          <Text className="text-sm text-primary-600 font-medium" style={ta}>
            Change avatar
          </Text>
        </Pressable>
      </Card>
      <View style={rtlRowMerge(rtl, { gap: 8 })}>
        <View className="flex-1">
          <Field label="Level" value={draft.level} onChangeText={(v) => set({ level: v })} rtl={rtl} />
        </View>
        <View className="flex-1">
          <ToggleRow label="Admin" value={draft.isAdmin} onChange={(v) => set({ isAdmin: v })} rtl={rtl} />
        </View>
      </View>
      <View style={rtlRowMerge(rtl, { gap: 8 })}>
        <View className="flex-1">
          <Field label="Coins" value={draft.coins} onChangeText={(v) => set({ coins: v })} rtl={rtl} keyboardType="numeric" />
        </View>
        <View className="flex-1">
          <Field label="XP" value={draft.xp} onChangeText={(v) => set({ xp: v })} rtl={rtl} keyboardType="numeric" />
        </View>
      </View>
      <View style={rtlRowMerge(rtl, { gap: 8 })}>
        <View className="flex-1">
          <Field label="Streak" value={draft.streak} onChangeText={(v) => set({ streak: v })} rtl={rtl} keyboardType="numeric" />
        </View>
        <View className="flex-1">
          <Field
            label="Longest streak"
            value={draft.longestStreak}
            onChangeText={(v) => set({ longestStreak: v })}
            rtl={rtl}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text className="text-sm text-gray-800 font-semibold mt-1" style={ta}>
        Profile
      </Text>
      <Field label="Mobile" value={draft.mobile} onChangeText={(v) => set({ mobile: v })} rtl={rtl} keyboardType="phone-pad" />
      <Field
        label="Date of birth"
        value={draft.dateOfBirth}
        onChangeText={(v) => set({ dateOfBirth: v })}
        rtl={rtl}
        hint="YYYY-MM-DD"
      />
      <Field
        label="Gender"
        value={draft.gender}
        onChangeText={(v) => set({ gender: v })}
        rtl={rtl}
        hint="male, female, other"
      />
      <View style={rtlRowMerge(rtl, { gap: 8 })}>
        <View className="flex-1">
          <Field label="Governorate" value={draft.governorate} onChangeText={(v) => set({ governorate: v })} rtl={rtl} />
        </View>
        <View className="flex-1">
          <Field label="City" value={draft.city} onChangeText={(v) => set({ city: v })} rtl={rtl} />
        </View>
      </View>
      <Field
        label="User type"
        value={draft.userType}
        onChangeText={(v) => set({ userType: v })}
        rtl={rtl}
        hint="student, employed, both"
      />
      <Field label="School" value={draft.schoolName} onChangeText={(v) => set({ schoolName: v })} rtl={rtl} />
      <Field label="Faculty / major" value={draft.facultyMajor} onChangeText={(v) => set({ facultyMajor: v })} rtl={rtl} />
      <Field label="Academic year" value={draft.academicYear} onChangeText={(v) => set({ academicYear: v })} rtl={rtl} />
      <Field label="Employer" value={draft.employer} onChangeText={(v) => set({ employer: v })} rtl={rtl} />
      <Field
        label="Monthly income"
        value={draft.monthlyIncomeRange}
        onChangeText={(v) => set({ monthlyIncomeRange: v })}
        rtl={rtl}
        hint="lt_3000, 3000_5000, 5000_10000, gt_10000"
      />
      <Field
        label="Financial goals"
        value={draft.financialGoals}
        onChangeText={(v) => set({ financialGoals: v })}
        rtl={rtl}
        hint="Comma-separated: saving, investing, learning, business"
      />
      <Field
        label="Financial literacy"
        value={draft.financialLiteracy}
        onChangeText={(v) => set({ financialLiteracy: v })}
        rtl={rtl}
        hint="beginner, intermediate, advanced"
      />
      <Field label="Persona" value={draft.persona} onChangeText={(v) => set({ persona: v })} rtl={rtl} />

      <Text className="text-sm text-gray-800 font-semibold mt-1" style={ta}>
        Parent / referral
      </Text>
      <Field
        label="Parent email"
        value={draft.parentEmail}
        onChangeText={(v) => set({ parentEmail: v })}
        rtl={rtl}
        keyboardType="email-address"
      />
      <Field label="Parent phone" value={draft.parentPhone} onChangeText={(v) => set({ parentPhone: v })} rtl={rtl} keyboardType="phone-pad" />
      <Field
        label="Referred by code"
        value={draft.referredByCode}
        onChangeText={(v) => set({ referredByCode: v })}
        rtl={rtl}
      />
      <ToggleRow
        label="Referral onboarding pending"
        value={draft.referralOnboardingPending}
        onChange={(v) => set({ referralOnboardingPending: v })}
        rtl={rtl}
      />
    </View>
  );
}
