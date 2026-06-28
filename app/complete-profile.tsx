import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { CheckCircle2, ChevronDown } from 'lucide-react-native';

import { AutocompleteField } from '@/components/profile/AutocompleteField';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { AvatarPickerModal } from '@/components/profile/AvatarPickerModal';
import { DateOfBirthPicker } from '@/components/profile/DateOfBirthPicker';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useT } from '@/hooks/useT';
import { notifyError, notifySuccess } from '@/lib/celebration';
import { getApiBaseUrl } from '@/lib/api';
import { DEFAULT_AVATAR_ID } from '@/lib/avatarPresets';
import {
  ACADEMIC_YEARS,
  EGYPT_CITIES,
  EGYPT_EMPLOYERS,
  EGYPT_FACULTIES,
  EGYPT_GOVERNORATES,
  EGYPT_SCHOOLS,
} from '@/lib/egyptSchools';
import { isProfileFieldFilled, profileCompletionPercent } from '@/lib/profileCompletion';
import {
  FINANCIAL_GOAL_OPTIONS,
  FINANCIAL_LITERACY_OPTIONS,
  GENDER_OPTIONS,
  INCOME_RANGE_OPTIONS,
  USER_TYPE_OPTIONS,
  type FinancialGoal,
  type FinancialLiteracy,
  type Gender,
  type IncomeRange,
  type UserType,
} from '@/lib/profileTypes';
import {
  mergeScrollContentRtl,
  rtlRootDirection,
  rtlRowMerge,
  rtlTextStyle,
} from '@/lib/rtlStyle';
import { useAuthStore, useUserStore, type UserProfile } from '@/stores';

type ProfileFieldKey =
  | 'avatar'
  | 'name'
  | 'dateOfBirth'
  | 'gender'
  | 'mobile'
  | 'email'
  | 'city'
  | 'governorate'
  | 'userType'
  | 'schoolName'
  | 'facultyMajor'
  | 'academicYear'
  | 'employer'
  | 'monthlyIncome'
  | 'financialGoals'
  | 'financialLiteracy'
  | 'parentEmail'
  | 'parentPhone'
  | 'myReferralCode';

function buildFieldDone(draft: UserProfile) {
  return {
    avatar: draft.avatar !== DEFAULT_AVATAR_ID,
    name: isProfileFieldFilled(draft.name),
    dateOfBirth: isProfileFieldFilled(draft.dateOfBirth),
    gender: isProfileFieldFilled(draft.gender),
    mobile: isProfileFieldFilled(draft.mobile),
    email: isProfileFieldFilled(draft.email),
    city: isProfileFieldFilled(draft.city),
    governorate: isProfileFieldFilled(draft.governorate),
    userType: isProfileFieldFilled(draft.userType),
    schoolName: isProfileFieldFilled(draft.schoolName),
    facultyMajor: isProfileFieldFilled(draft.facultyMajor),
    academicYear: isProfileFieldFilled(draft.academicYear),
    employer: isProfileFieldFilled(draft.employer),
    monthlyIncome: isProfileFieldFilled(draft.monthlyIncomeRange),
    financialGoals: draft.financialGoals.length > 0,
    financialLiteracy: isProfileFieldFilled(draft.financialLiteracy),
    parentEmail: isProfileFieldFilled(draft.parentEmail),
    parentPhone: isProfileFieldFilled(draft.parentPhone),
    myReferralCode: isProfileFieldFilled(draft.referralCode),
  } satisfies Record<ProfileFieldKey, boolean>;
}

function initialTouchedFields(draft: UserProfile): Set<ProfileFieldKey> {
  const done = buildFieldDone(draft);
  const touched = new Set<ProfileFieldKey>();
  (Object.keys(done) as ProfileFieldKey[]).forEach((key) => {
    if (done[key]) touched.add(key);
  });
  return touched;
}

function FieldRow({
  rtl,
  label,
  complete,
  children,
}: {
  rtl: boolean;
  label: string;
  complete: boolean;
  children: ReactNode;
}) {
  const ta = rtlTextStyle(rtl);
  return (
    <View>
      <View
        style={rtlRowMerge(rtl, {
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
          gap: 8,
        })}
      >
        <Text style={[ta, { fontSize: 14, color: '#374151', flex: 1 }]}>{label}</Text>
        {complete ? <CheckCircle2 size={18} color="#16a34a" /> : null}
      </View>
      {children}
    </View>
  );
}

function FieldInput({
  rtl,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  editable = true,
  complete = false,
  onFocusField,
  onBlurField,
}: {
  rtl: boolean;
  value: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  editable?: boolean;
  complete?: boolean;
  onFocusField?: () => void;
  onBlurField?: () => void;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText ?? (() => {})}
      placeholder={placeholder}
      keyboardType={keyboardType}
      autoCapitalize="none"
      editable={editable}
      onFocus={onFocusField}
      onBlur={onBlurField}
      style={{
        borderWidth: 1.5,
        borderColor: complete ? '#86efac' : '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: editable ? '#111827' : '#6b7280',
        backgroundColor: complete ? '#f0fdf4' : editable ? '#ffffff' : '#f9fafb',
        textAlign: rtl ? 'right' : 'left',
        writingDirection: rtl ? 'rtl' : 'ltr',
      }}
    />
  );
}

function ChipRow<T extends string>({
  rtl,
  options,
  value,
  onChange,
  labelFor,
  onFocusField,
}: {
  rtl: boolean;
  options: readonly T[];
  value: T | null;
  onChange: (v: T | null) => void;
  labelFor: (v: T) => string;
  onFocusField?: () => void;
}) {
  return (
    <View style={[rtlRowMerge(rtl, { flexWrap: 'wrap', gap: 8 })]}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => {
              onFocusField?.();
              onChange(active ? null : opt);
            }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: active ? '#2563eb' : '#e5e7eb',
              backgroundColor: active ? '#eff6ff' : '#fff',
            }}
          >
            <Text style={[rtlTextStyle(rtl), { fontSize: 14, color: active ? '#1d4ed8' : '#374151' }]}>
              {labelFor(opt)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MultiChipRow({
  rtl,
  options,
  values,
  onToggle,
  labelFor,
  onFocusField,
}: {
  rtl: boolean;
  options: readonly FinancialGoal[];
  values: FinancialGoal[];
  onToggle: (v: FinancialGoal) => void;
  labelFor: (v: FinancialGoal) => string;
  onFocusField?: () => void;
}) {
  return (
    <View style={[rtlRowMerge(rtl, { flexWrap: 'wrap', gap: 8 })]}>
      {options.map((opt) => {
        const active = values.includes(opt);
        return (
          <Pressable
            key={opt}
            onPress={() => {
              onFocusField?.();
              onToggle(opt);
            }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: active ? '#2563eb' : '#e5e7eb',
              backgroundColor: active ? '#eff6ff' : '#fff',
            }}
          >
            <Text style={[rtlTextStyle(rtl), { fontSize: 14, color: active ? '#1d4ed8' : '#374151' }]}>
              {labelFor(opt)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SectionTitle({ rtl, title }: { rtl: boolean; title: string }) {
  return (
    <Text style={[rtlTextStyle(rtl), { fontSize: 17, fontWeight: '600', color: '#111827', marginBottom: 12 }]}>
      {title}
    </Text>
  );
}

function ReferralCodeBox({
  rtl,
  code,
  loading,
  loadingLabel,
  emptyLabel,
  onRetry,
  retryLabel,
}: {
  rtl: boolean;
  code: string;
  loading: boolean;
  loadingLabel: string;
  emptyLabel: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const display = loading ? loadingLabel : code || emptyLabel;
  const hasCode = !!code && !loading;
  return (
    <View style={{ gap: 10 }}>
      <View
        style={{
          borderWidth: 1.5,
          borderColor: hasCode ? '#93c5fd' : '#e5e7eb',
          borderRadius: 12,
          paddingVertical: 16,
          paddingHorizontal: 14,
          backgroundColor: hasCode ? '#eff6ff' : '#f9fafb',
          alignItems: 'center',
        }}
      >
        <Text
          style={[
            rtlTextStyle(rtl),
            {
              fontSize: hasCode ? 24 : 15,
              fontWeight: hasCode ? '700' : '500',
              letterSpacing: hasCode ? 6 : 0,
              color: hasCode ? '#1d4ed8' : '#6b7280',
              textAlign: 'center',
            },
          ]}
        >
          {display}
        </Text>
      </View>
      {!hasCode && !loading && onRetry ? (
        <Pressable
          onPress={onRetry}
          style={{
            alignSelf: 'center',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: '#2563eb',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function CompleteProfileScreen() {
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const stored = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const saveExtendedProfile = useUserStore((s) => s.saveExtendedProfile);
  const refreshMyReferralCode = useUserStore((s) => s.refreshMyReferralCode);
  const remoteUserId = useUserStore((s) => s.remoteUserId);
  const authEmail = useAuthStore((s) => s.user?.email ?? '');

  const [draft, setDraft] = useState<UserProfile>({ ...stored, email: stored.email || authEmail });
  const [saving, setSaving] = useState(false);
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralStaleApi, setReferralStaleApi] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [touched, setTouched] = useState<Set<ProfileFieldKey>>(() =>
    initialTouchedFields({ ...stored, email: stored.email || authEmail }),
  );
  const activeFieldRef = useRef<ProfileFieldKey | null>(null);

  const noteFieldFocus = useCallback((key: ProfileFieldKey) => {
    const prev = activeFieldRef.current;
    if (prev && prev !== key) {
      setTouched((current) => new Set(current).add(prev));
    }
    activeFieldRef.current = key;
  }, []);

  const noteFieldBlur = useCallback((key: ProfileFieldKey) => {
    setTouched((current) => new Set(current).add(key));
    if (activeFieldRef.current === key) {
      activeFieldRef.current = null;
    }
  }, []);

  const fieldProps = useCallback(
    (key: ProfileFieldKey) => ({
      onFocusField: () => noteFieldFocus(key),
      onBlurField: () => noteFieldBlur(key),
    }),
    [noteFieldBlur, noteFieldFocus],
  );

  const pct = useMemo(
    () => profileCompletionPercent({ name: draft.name, avatar: draft.avatar, ...draft }),
    [draft],
  );

  const loadReferralCode = useCallback(() => {
    if (!remoteUserId) return;
    setReferralLoading(true);
    void refreshMyReferralCode()
      .then(({ code, staleApi }) => {
        setReferralStaleApi(staleApi);
        if (code) {
          setDraft((d) => (d.referralCode === code ? d : { ...d, referralCode: code }));
        }
      })
      .finally(() => setReferralLoading(false));
  }, [remoteUserId, refreshMyReferralCode]);

  useEffect(() => {
    if (!stored.referralCode) return;
    setDraft((d) =>
      d.referralCode === stored.referralCode ? d : { ...d, referralCode: stored.referralCode },
    );
  }, [stored.referralCode]);

  useEffect(() => {
    loadReferralCode();
  }, [loadReferralCode]);

  const patch = (p: Partial<UserProfile>) => setDraft((d) => ({ ...d, ...p }));

  const toggleGoal = (g: FinancialGoal) => {
    setDraft((d) => ({
      ...d,
      financialGoals: d.financialGoals.includes(g)
        ? d.financialGoals.filter((x) => x !== g)
        : [...d.financialGoals, g],
    }));
  };

  const handleSave = async () => {
    if (!remoteUserId) {
      updateProfile(draft);
      notifySuccess(t('profile.saved'), t('profile.signInToSave'));
      router.back();
      return;
    }
    setSaving(true);
    updateProfile(draft);
    const res = await saveExtendedProfile();
    setSaving(false);
    if (!res.ok) {
      notifyError(t('profile.saveFailed'), res.error ?? '');
      return;
    }
    notifySuccess(t('profile.saved'), '');
    router.back();
  };

  const showStudent = draft.userType === 'student' || draft.userType === 'both';
  const showEmployed = draft.userType === 'employed' || draft.userType === 'both';

  const fieldDone = buildFieldDone(draft);
  const showCheck = (key: ProfileFieldKey) => touched.has(key) && fieldDone[key];

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader title={t('profile.completeYourProfile')} showBack />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 120, gap: 16 })}
          keyboardShouldPersistTaps="handled"
        >
          <Card>
            <Text style={[ta, { fontSize: 15, color: '#4b5563', marginBottom: 8 }]}>
              {t('profile.completeSubtitle')}
            </Text>
            <Text style={[ta, { fontSize: 14, color: '#6b7280', marginBottom: 8 }]}>
              {t('profile.completionPct', { pct })}
            </Text>
            <ProgressBar value={pct} height={8} />
          </Card>

          <Card>
            <View
              style={rtlRowMerge(rtl, {
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              })}
            >
              <Text style={[ta, { fontSize: 17, fontWeight: '600', color: '#111827' }]}>
                {t('profile.avatar')}
              </Text>
              {showCheck('avatar') ? <CheckCircle2 size={18} color="#16a34a" /> : null}
            </View>
            <Pressable
              onPress={() => {
                noteFieldFocus('avatar');
                setAvatarOpen(true);
              }}
              style={[
                rtlRowMerge(rtl, {
                  alignItems: 'center',
                  gap: 12,
                  borderWidth: 1.5,
                  borderColor: showCheck('avatar') ? '#86efac' : '#e5e7eb',
                  borderRadius: 12,
                  padding: 14,
                  backgroundColor: showCheck('avatar') ? '#f0fdf4' : '#fff',
                }),
              ]}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#eff6ff',
                  borderWidth: 1,
                  borderColor: '#bfdbfe',
                }}
              >
              <ProfileAvatar avatar={draft.avatar} size={52} />
              </View>
              <Text style={[ta, { flex: 1, fontSize: 15, color: '#374151' }]}>
                {t('profile.chooseAvatarBtn')}
              </Text>
              <ChevronDown size={20} color="#6b7280" />
            </Pressable>
          </Card>

          <AvatarPickerModal
            visible={avatarOpen}
            rtl={rtl}
            selected={draft.avatar}
            title={t('profile.avatar')}
            onClose={() => {
              setAvatarOpen(false);
              noteFieldBlur('avatar');
            }}
            onSelect={(avatar) => patch({ avatar })}
          />

          <Card>
            <SectionTitle rtl={rtl} title={t('profile.sectionBasic')} />
            <View className="gap-4">
              <FieldRow rtl={rtl} label={t('profile.fullName')} complete={showCheck('name')}>
                <FieldInput
                  rtl={rtl}
                  value={draft.name}
                  onChangeText={(name) => patch({ name })}
                  complete={showCheck('name')}
                  {...fieldProps('name')}
                />
              </FieldRow>
              <FieldRow rtl={rtl} label={t('profile.dateOfBirth')} complete={showCheck('dateOfBirth')}>
                <DateOfBirthPicker
                  rtl={rtl}
                  value={draft.dateOfBirth}
                  label={t('profile.dateOfBirth')}
                  hint={t('profile.dateOfBirthHint')}
                  doneLabel={t('action.confirm')}
                  complete={showCheck('dateOfBirth')}
                  onChange={(dateOfBirth) => patch({ dateOfBirth })}
                  {...fieldProps('dateOfBirth')}
                />
              </FieldRow>
              <FieldRow rtl={rtl} label={t('profile.gender')} complete={showCheck('gender')}>
                <ChipRow<Gender>
                  rtl={rtl}
                  options={GENDER_OPTIONS}
                  value={draft.gender}
                  onChange={(gender) => patch({ gender })}
                  labelFor={(g) => t(`profile.gender.${g}`)}
                  {...fieldProps('gender')}
                />
              </FieldRow>
              <FieldRow rtl={rtl} label={t('profile.mobile')} complete={showCheck('mobile')}>
                <FieldInput
                  rtl={rtl}
                  value={draft.mobile}
                  onChangeText={(mobile) => patch({ mobile })}
                  keyboardType="phone-pad"
                  complete={showCheck('mobile')}
                  {...fieldProps('mobile')}
                />
              </FieldRow>
              <FieldRow rtl={rtl} label={t('profile.email')} complete={showCheck('email')}>
                <FieldInput rtl={rtl} value={draft.email} onChangeText={() => {}} editable={false} />
              </FieldRow>
              <FieldRow rtl={rtl} label={t('profile.city')} complete={showCheck('city')}>
                <AutocompleteField
                  rtl={rtl}
                  label={t('profile.city')}
                  value={draft.city}
                  onChange={(city) => patch({ city })}
                  options={EGYPT_CITIES}
                  complete={showCheck('city')}
                  {...fieldProps('city')}
                />
              </FieldRow>
              <FieldRow rtl={rtl} label={t('profile.governorate')} complete={showCheck('governorate')}>
                <AutocompleteField
                  rtl={rtl}
                  label={t('profile.governorate')}
                  value={draft.governorate}
                  onChange={(governorate) => patch({ governorate })}
                  options={EGYPT_GOVERNORATES}
                  complete={showCheck('governorate')}
                  {...fieldProps('governorate')}
                />
              </FieldRow>
            </View>
          </Card>

          <Card>
            <SectionTitle rtl={rtl} title={t('profile.sectionEducation')} />
            <View className="gap-4">
              <FieldRow rtl={rtl} label={t('profile.userType')} complete={showCheck('userType')}>
                <ChipRow<UserType>
                  rtl={rtl}
                  options={USER_TYPE_OPTIONS}
                  value={draft.userType}
                  onChange={(userType) => patch({ userType })}
                  labelFor={(u) => t(`profile.userType.${u}`)}
                  {...fieldProps('userType')}
                />
              </FieldRow>
              <FieldRow rtl={rtl} label={t('profile.schoolName')} complete={showCheck('schoolName')}>
                <AutocompleteField
                  rtl={rtl}
                  label={t('profile.schoolName')}
                  value={draft.schoolName}
                  onChange={(schoolName) => patch({ schoolName })}
                  options={EGYPT_SCHOOLS}
                  limit={20}
                  complete={showCheck('schoolName')}
                  {...fieldProps('schoolName')}
                />
              </FieldRow>
              {showStudent ? (
                <>
                  <FieldRow rtl={rtl} label={t('profile.facultyMajor')} complete={showCheck('facultyMajor')}>
                    <AutocompleteField
                      rtl={rtl}
                      label={t('profile.facultyMajor')}
                      value={draft.facultyMajor}
                      onChange={(facultyMajor) => patch({ facultyMajor })}
                      options={EGYPT_FACULTIES}
                      complete={showCheck('facultyMajor')}
                      {...fieldProps('facultyMajor')}
                    />
                  </FieldRow>
                  <FieldRow rtl={rtl} label={t('profile.academicYear')} complete={showCheck('academicYear')}>
                    <AutocompleteField
                      rtl={rtl}
                      label={t('profile.academicYear')}
                      value={draft.academicYear}
                      onChange={(academicYear) => patch({ academicYear })}
                      options={ACADEMIC_YEARS}
                      complete={showCheck('academicYear')}
                      {...fieldProps('academicYear')}
                    />
                  </FieldRow>
                </>
              ) : null}
              {showEmployed ? (
                <FieldRow rtl={rtl} label={t('profile.employer')} complete={showCheck('employer')}>
                  <AutocompleteField
                    rtl={rtl}
                    label={t('profile.employer')}
                    value={draft.employer}
                    onChange={(employer) => patch({ employer })}
                    options={EGYPT_EMPLOYERS}
                    complete={showCheck('employer')}
                    {...fieldProps('employer')}
                  />
                </FieldRow>
              ) : null}
            </View>
          </Card>

          <Card>
            <SectionTitle rtl={rtl} title={t('profile.sectionFinancial')} />
            <FieldRow rtl={rtl} label={t('profile.monthlyIncome')} complete={showCheck('monthlyIncome')}>
              <ChipRow<IncomeRange>
                rtl={rtl}
                options={INCOME_RANGE_OPTIONS}
                value={draft.monthlyIncomeRange}
                onChange={(monthlyIncomeRange) => patch({ monthlyIncomeRange })}
                labelFor={(r) => t(`profile.income.${r}`)}
                {...fieldProps('monthlyIncome')}
              />
            </FieldRow>
          </Card>

          <Card>
            <SectionTitle rtl={rtl} title={t('profile.sectionBehavior')} />
            <View className="gap-4">
              <FieldRow rtl={rtl} label={t('profile.financialGoals')} complete={showCheck('financialGoals')}>
                <MultiChipRow
                  rtl={rtl}
                  options={FINANCIAL_GOAL_OPTIONS}
                  values={draft.financialGoals}
                  onToggle={toggleGoal}
                  labelFor={(g) => t(`profile.goal.${g}`)}
                  {...fieldProps('financialGoals')}
                />
              </FieldRow>
              <FieldRow
                rtl={rtl}
                label={t('profile.financialLiteracy')}
                complete={showCheck('financialLiteracy')}
              >
                <ChipRow<FinancialLiteracy>
                  rtl={rtl}
                  options={FINANCIAL_LITERACY_OPTIONS}
                  value={draft.financialLiteracy}
                  onChange={(financialLiteracy) => patch({ financialLiteracy })}
                  labelFor={(l) => t(`profile.literacy.${l}`)}
                  {...fieldProps('financialLiteracy')}
                />
              </FieldRow>
              <View>
                <Text style={[ta, { fontSize: 14, color: '#374151', marginBottom: 6 }]}>
                  {t('profile.persona')}
                </Text>
                <Text style={[ta, { fontSize: 13, color: '#6b7280' }]}>
                  {draft.persona ?? t('profile.personaHint')}
                </Text>
              </View>
            </View>
          </Card>

          <Card>
            <SectionTitle rtl={rtl} title={t('profile.sectionExtra')} />
            <View className="gap-4">
              <FieldRow rtl={rtl} label={t('profile.parentEmail')} complete={showCheck('parentEmail')}>
                <FieldInput
                  rtl={rtl}
                  value={draft.parentEmail}
                  onChangeText={(parentEmail) => patch({ parentEmail })}
                  keyboardType="email-address"
                  complete={showCheck('parentEmail')}
                  {...fieldProps('parentEmail')}
                />
              </FieldRow>
              <FieldRow rtl={rtl} label={t('profile.parentPhone')} complete={showCheck('parentPhone')}>
                <FieldInput
                  rtl={rtl}
                  value={draft.parentPhone}
                  onChangeText={(parentPhone) => patch({ parentPhone })}
                  keyboardType="phone-pad"
                  complete={showCheck('parentPhone')}
                  {...fieldProps('parentPhone')}
                />
              </FieldRow>
              <FieldRow rtl={rtl} label={t('profile.myReferralCode')} complete={showCheck('myReferralCode')}>
                <ReferralCodeBox
                  rtl={rtl}
                  code={draft.referralCode}
                  loading={referralLoading}
                  loadingLabel={t('profile.referralCodeLoading')}
                  emptyLabel={
                    !remoteUserId
                      ? t('profile.referralCodeSignIn')
                      : referralStaleApi
                        ? t('profile.referralCodeServerPending')
                        : t('profile.referralCodeUnavailable')
                  }
                  onRetry={remoteUserId ? loadReferralCode : undefined}
                  retryLabel={t('profile.referralCodeRetry')}
                />
              </FieldRow>
              {draft.referralCode ? (
                <Text style={[ta, { fontSize: 13, color: '#6b7280', marginTop: -8, marginBottom: 8 }]}>
                  {t('profile.myReferralCodeHint')}
                </Text>
              ) : null}
              {referralStaleApi ? (
                <Text style={[ta, { fontSize: 13, color: '#b45309', marginTop: -8, marginBottom: 8 }]}>
                  {t('profile.referralCodeServerCheck', {
                    url: `${getApiBaseUrl()}/health`,
                  })}
                </Text>
              ) : null}
            </View>
          </Card>

          <Button fullWidth onPress={() => void handleSave()} disabled={saving}>
            {saving ? t('auth.creatingAccount') : t('action.save')}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
