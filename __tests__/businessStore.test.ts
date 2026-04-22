import { CORP_TAX_RATE, VAT_RATE, useBusinessStore } from '@/stores/useBusinessStore';

describe('useBusinessStore tax logic', () => {
  beforeEach(() => {
    useBusinessStore.getState().reset();
  });

  test('runMonth computes VAT and corporate tax, accumulates payables', () => {
    const rev = 100_000;
    const exp = 40_000;
    const report = useBusinessStore.getState().runMonth(rev, exp);

    const gross = rev - exp;
    const expectedVat = rev * VAT_RATE;
    const expectedCorp = gross * CORP_TAX_RATE;

    expect(report.vatCollected).toBeCloseTo(expectedVat);
    expect(report.corporateTax).toBeCloseTo(expectedCorp);
    expect(report.grossProfit).toBeCloseTo(gross);
    expect(report.netProfit).toBeCloseTo(gross - expectedVat - expectedCorp);

    const s = useBusinessStore.getState();
    expect(s.vatPayable).toBeCloseTo(expectedVat);
    expect(s.corpTaxPayable).toBeCloseTo(expectedCorp);
    expect(s.monthsRunning).toBe(1);
  });

  test('payTaxes clears payables when enough cash', () => {
    useBusinessStore.getState().runMonth(100_000, 40_000);
    const before = useBusinessStore.getState();
    const due = before.vatPayable + before.corpTaxPayable;
    const res = useBusinessStore.getState().payTaxes();
    expect(res.ok).toBe(true);
    expect(res.paid).toBeCloseTo(due);
    const after = useBusinessStore.getState();
    expect(after.vatPayable).toBe(0);
    expect(after.corpTaxPayable).toBe(0);
    expect(after.cash).toBeCloseTo(before.cash - due);
  });
});

