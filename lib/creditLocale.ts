import type { Locale } from '@/lib/i18n';
import { translate } from '@/lib/i18n';
import {
  CREDIT_ACTION_DEFINITIONS,
  type CreditAction,
  type CreditActionType,
} from '@/stores/useCreditStore';

const LABEL_TO_TYPE: Partial<Record<string, CreditActionType>> = {};
for (const type of Object.keys(
  CREDIT_ACTION_DEFINITIONS
) as CreditActionType[]) {
  LABEL_TO_TYPE[CREDIT_ACTION_DEFINITIONS[type].label] = type;
}
// Persisted history from older builds
LABEL_TO_TYPE['BNPL paid on schedule'] = 'bnpl_responsible';
LABEL_TO_TYPE['Missed BNPL installment'] = 'bnpl_missed';

export function resolveCreditActionType(
  action: Pick<CreditAction, 'type' | 'label'>
): CreditActionType | undefined {
  if (action.type) return action.type;
  return LABEL_TO_TYPE[action.label];
}

export function creditActionLabelForAction(
  action: Pick<CreditAction, 'type' | 'label'>,
  locale: Locale
): string {
  const type = resolveCreditActionType(action);
  if (type) return creditActionLabel(type, locale);
  return action.label;
}

export function creditActionLabel(type: CreditActionType, locale: Locale): string {
  return translate(locale, `credit.action.${type}.label`);
}

export function creditActionDescription(
  type: CreditActionType,
  locale: Locale
): string {
  return translate(locale, `credit.action.${type}.description`);
}

export function scoreCategoryLabel(
  score: number,
  locale: Locale
): { label: string; color: string; bg: string } {
  if (score >= 800)
    return {
      label: translate(locale, 'credit.score.excellent'),
      color: '#16a34a',
      bg: '#dcfce7',
    };
  if (score >= 740)
    return {
      label: translate(locale, 'credit.score.veryGood'),
      color: '#2563eb',
      bg: '#dbeafe',
    };
  if (score >= 670)
    return {
      label: translate(locale, 'credit.score.good'),
      color: '#ca8a04',
      bg: '#fef3c7',
    };
  if (score >= 580)
    return {
      label: translate(locale, 'credit.score.fair'),
      color: '#ea580c',
      bg: '#ffedd5',
    };
  return {
    label: translate(locale, 'credit.score.poor'),
    color: '#dc2626',
    bg: '#fee2e2',
  };
}
