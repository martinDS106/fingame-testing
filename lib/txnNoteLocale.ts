import type { Locale } from '@/lib/i18n';
import { translate } from '@/lib/i18n';
import type { TxnCategory } from '@/stores';

/** English note text (from persisted txns) → i18n keys used when creating the note */
const EN_NOTE_TO_KEYS: Record<string, { titleKey: string; catKey: string }> =
  {};

function regNote(titleKey: string, catKey: string) {
  const en = `${translate('en', titleKey)} · ${translate('en', catKey)}`;
  EN_NOTE_TO_KEYS[en] = { titleKey, catKey };
}

regNote('banking.deposit.title', 'banking.deposit.cat.salary');
regNote('banking.deposit.title', 'banking.deposit.cat.other');
regNote('banking.withdraw.title', 'banking.withdraw.cat.food');
regNote('banking.withdraw.title', 'banking.withdraw.cat.transport');
regNote('banking.withdraw.title', 'banking.withdraw.cat.shopping');
regNote('banking.withdraw.title', 'banking.withdraw.cat.entertainment');
regNote('banking.withdraw.title', 'banking.withdraw.cat.education');
regNote('banking.withdraw.title', 'banking.withdraw.cat.other');
regNote('banking.payBill.title', 'banking.payBill.cat.utilities');
regNote('banking.payBill.title', 'banking.payBill.cat.internet');
regNote('banking.payBill.title', 'banking.payBill.cat.phone');
regNote('banking.transfer.title', 'banking.transfer.cat.toSavings');

const EN_TRANSFER_SAVINGS = translate('en', 'banking.transferToSavingsNote');

export function localizedTxnNote(
  note: string | undefined,
  locale: Locale
): string | undefined {
  if (!note) return undefined;
  if (locale === 'en') return note;

  const keys = EN_NOTE_TO_KEYS[note.trim()];
  if (keys) {
    return `${translate(locale, keys.titleKey)} · ${translate(locale, keys.catKey)}`;
  }

  if (
    note === EN_TRANSFER_SAVINGS ||
    note.startsWith('Transfer to ') ||
    note === translate('ar', 'banking.transferToSavingsNote')
  ) {
    return translate(locale, 'banking.transferToSavingsNote');
  }

  if (/^Contribution to goal/i.test(note)) {
    return translate(locale, 'banking.goalContributionNote');
  }

  return note;
}

export function localizedTxnSubtitle(
  category: TxnCategory,
  locale: Locale
): string {
  return translate(locale, `txn.${category}`);
}
