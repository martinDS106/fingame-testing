import {
  daysBetweenDates,
  localDateStamp,
  normalizeDateStamp,
} from '@/lib/dateStamp';

describe('dateStamp', () => {
  test('normalizeDateStamp handles ISO datetime', () => {
    expect(normalizeDateStamp('2026-05-25T18:30:00.000Z')).toBe('2026-05-25');
  });

  test('daysBetweenDates counts calendar days', () => {
    expect(daysBetweenDates('2026-05-23', '2026-05-25')).toBe(2);
  });

  test('localDateStamp returns YYYY-MM-DD', () => {
    const s = localDateStamp(new Date(2026, 4, 25, 23, 30));
    expect(s).toBe('2026-05-25');
  });
});
