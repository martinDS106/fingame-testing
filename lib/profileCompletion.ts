import type { ExtendedProfileFields } from '@/lib/profileTypes';
import { FINANCIAL_GOAL_OPTIONS } from '@/lib/profileTypes';

type CompletionInput = {
  name: string;
  avatar: string;
} & ExtendedProfileFields;

const TRACKED: { key: keyof CompletionInput; optional?: boolean }[] = [
  { key: 'name' },
  { key: 'mobile' },
  { key: 'governorate' },
  { key: 'city' },
  { key: 'userType' },
  { key: 'schoolName' },
  { key: 'monthlyIncomeRange' },
  { key: 'financialLiteracy' },
  { key: 'avatar' },
  { key: 'dateOfBirth', optional: true },
  { key: 'gender', optional: true },
  { key: 'parentEmail', optional: true },
];

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export { isFilled as isProfileFieldFilled };

export function profileCompletionPercent(input: CompletionInput): number {
  const required = TRACKED.filter((t) => !t.optional);
  const optional = TRACKED.filter((t) => t.optional);
  let score = 0;
  let max = 0;

  for (const { key } of required) {
    max += 1;
    if (key === 'financialGoals') {
      if (input.financialGoals.length > 0) score += 1;
    } else if (isFilled(input[key])) {
      score += 1;
    }
  }

  max += 1;
  if (input.financialGoals.length > 0) score += 1;

  for (const { key } of optional) {
    max += 0.5;
    if (isFilled(input[key])) score += 0.5;
  }

  return Math.min(100, Math.round((score / max) * 100));
}

export function isProfileComplete(input: CompletionInput): boolean {
  return (
    isFilled(input.name) &&
    isFilled(input.mobile) &&
    isFilled(input.governorate) &&
    isFilled(input.city) &&
    isFilled(input.userType) &&
    isFilled(input.monthlyIncomeRange) &&
    isFilled(input.financialLiteracy) &&
    input.financialGoals.some((g) => FINANCIAL_GOAL_OPTIONS.includes(g))
  );
}
