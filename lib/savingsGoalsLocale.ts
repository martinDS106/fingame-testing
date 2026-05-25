import type { Locale } from '@/lib/i18n';
import { translate } from '@/lib/i18n';

const PRESET_GOAL_IDS = new Set(['goal-car', 'goal-vacation']);

export function isPresetSavingsGoal(id: string): boolean {
  return PRESET_GOAL_IDS.has(id);
}

export function localizeSavingsGoalTitle(
  goalId: string,
  enTitle: string,
  locale: Locale
): string {
  if (locale !== 'ar' || !PRESET_GOAL_IDS.has(goalId)) return enTitle;
  const key = `savings.preset.${goalId}`;
  const tr = translate(locale, key);
  return tr === key ? enTitle : tr;
}
