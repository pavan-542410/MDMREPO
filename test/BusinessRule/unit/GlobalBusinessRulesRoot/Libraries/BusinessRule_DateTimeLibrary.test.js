const dt = require('../../../../../step-configs/BusinessRule/BusinessRule_DateTimeLibrary');

describe('BusinessRule_DateTimeLibrary', () => {
  test('pad left-pads single digit values and preserves double digits', () => {
    expect(dt.pad(3)).toBe('03');
    expect(dt.pad(12)).toBe(12);
  });

  test('nowISO and todayISO return ISO-like UTC/date strings', () => {
    expect(dt.nowISO()).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    expect(dt.todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('convertToISODate normalizes date strings with T, spaces, and date-only input', () => {
    expect(dt.convertToISODate('2024-03-01T12:34:56Z')).toBe('2024-03-01 12:34:56');
    expect(dt.convertToISODate('2024-03-01 09:08:07')).toBe('2024-03-01 09:08:07');
    expect(dt.convertToISODate('2024-03-01')).toBe('2024-03-01');
  });

  test('parseDate handles null and normalizes T/Z input before creating a Date', () => {
    expect(dt.parseDate(null)).toBeNull();
    expect(dt.parseDate('2024-03-01T12:34:56Z')).toBeInstanceOf(Date);
  });

  test('getEarliestDate and getLatestDate handle null fallbacks and compare valid dates', () => {
    expect(dt.getEarliestDate(null, null)).toBeNull();
    expect(dt.getEarliestDate(null, '2024-03-02')).toBe('2024-03-02');
    expect(dt.getEarliestDate('2024-03-01', null)).toBe('2024-03-01');
    expect(dt.getEarliestDate('2024-03-01', '2024-03-02')).toBe('2024-03-01');

    expect(dt.getLatestDate(null, null)).toBeNull();
    expect(dt.getLatestDate(null, '2024-03-02')).toBe('2024-03-02');
    expect(dt.getLatestDate('2024-03-01', null)).toBe('2024-03-01');
    expect(dt.getLatestDate('2024-03-01', '2024-03-02')).toBe('2024-03-02');
  });
});
