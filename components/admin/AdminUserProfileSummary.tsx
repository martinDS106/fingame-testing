import { Text, View } from 'react-native';

import { rtlTextStyle } from '@/lib/rtlStyle';
import type { RemoteProfile } from '@/lib/syncServiceApi';

function fmt(v: string | null | undefined): string {
  const s = v?.trim();
  return s ? s : '—';
}

type AdminUserProfileSummaryProps = {
  user: RemoteProfile;
  rtl: boolean;
  compact?: boolean;
};

function ProfileLine({
  label,
  value,
  rtl,
}: {
  label: string;
  value: string;
  rtl: boolean;
}) {
  const ta = rtlTextStyle(rtl);
  return (
    <Text className="text-xs text-gray-600" style={ta}>
      <Text className="text-gray-500">{label}: </Text>
      {value}
    </Text>
  );
}

export function AdminUserProfileSummary({
  user,
  rtl,
  compact = false,
}: AdminUserProfileSummaryProps) {
  const ta = rtlTextStyle(rtl);
  const goals =
    user.financial_goals?.length ? user.financial_goals.join(', ') : '—';

  if (compact) {
    return (
      <View className="mt-2 gap-0.5">
        <ProfileLine label="Email" value={fmt(user.email)} rtl={rtl} />
        <ProfileLine label="Mobile" value={fmt(user.mobile)} rtl={rtl} />
        <ProfileLine
          label="Location"
          value={[user.governorate, user.city].filter(Boolean).join(', ') || '—'}
          rtl={rtl}
        />
        <ProfileLine label="Referral code" value={fmt(user.referral_code)} rtl={rtl} />
        <ProfileLine label="Referred by" value={fmt(user.referred_by_code)} rtl={rtl} />
        <ProfileLine label="User type" value={fmt(user.user_type)} rtl={rtl} />
      </View>
    );
  }

  return (
    <View className="mt-2 pt-2 border-t border-gray-100 gap-1">
      <Text className="text-xs font-semibold text-gray-700 mb-1" style={ta}>
        Profile data
      </Text>
      <ProfileLine label="Email" value={fmt(user.email)} rtl={rtl} />
      <ProfileLine label="Mobile" value={fmt(user.mobile)} rtl={rtl} />
      <ProfileLine label="DOB" value={fmt(user.date_of_birth)} rtl={rtl} />
      <ProfileLine label="Gender" value={fmt(user.gender)} rtl={rtl} />
      <ProfileLine label="Governorate" value={fmt(user.governorate)} rtl={rtl} />
      <ProfileLine label="City" value={fmt(user.city)} rtl={rtl} />
      <ProfileLine label="User type" value={fmt(user.user_type)} rtl={rtl} />
      <ProfileLine label="School" value={fmt(user.school_name)} rtl={rtl} />
      <ProfileLine label="Faculty / major" value={fmt(user.faculty_major)} rtl={rtl} />
      <ProfileLine label="Academic year" value={fmt(user.academic_year)} rtl={rtl} />
      <ProfileLine label="Employer" value={fmt(user.employer)} rtl={rtl} />
      <ProfileLine label="Income range" value={fmt(user.monthly_income_range)} rtl={rtl} />
      <ProfileLine label="Financial goals" value={goals} rtl={rtl} />
      <ProfileLine label="Financial literacy" value={fmt(user.financial_literacy)} rtl={rtl} />
      <ProfileLine label="Persona" value={fmt(user.persona)} rtl={rtl} />
      <ProfileLine label="Parent email" value={fmt(user.parent_email)} rtl={rtl} />
      <ProfileLine label="Parent phone" value={fmt(user.parent_phone)} rtl={rtl} />
      <ProfileLine label="Referral code" value={fmt(user.referral_code)} rtl={rtl} />
      <ProfileLine label="Referred by" value={fmt(user.referred_by_code)} rtl={rtl} />
      <ProfileLine
        label="Referral onboarding"
        value={user.referral_onboarding_pending ? 'Pending' : 'Done'}
        rtl={rtl}
      />
      <ProfileLine label="Level" value={fmt(user.level)} rtl={rtl} />
      <ProfileLine label="Streak" value={String(user.streak ?? 0)} rtl={rtl} />
      <ProfileLine label="Longest streak" value={String(user.longest_streak ?? 0)} rtl={rtl} />
      <ProfileLine label="Profile completed" value={fmt(user.profile_completed_at)} rtl={rtl} />
      <ProfileLine label="Joined" value={fmt(user.created_at)} rtl={rtl} />
    </View>
  );
}
