import { validateWeight, sanitizeLCDSegmentText } from './WeightValidationService';

describe('WeightValidationService', () => {
  it('validates correct weight formats and accepts high confidence (>=90%)', () => {
    const res = validateWeight('57.8 kg', 0.96);
    expect(res.isValid).toBe(true);
    expect(res.weight).toBe(57.8);
    expect(res.confidenceTier).toBe('AUTO_ACCEPT');
  });

  it('cleans digital LCD 7-segment OCR misreads (5B.8kg -> 58.8)', () => {
    const cleaned = sanitizeLCDSegmentText('5B.8kg');
    expect(cleaned).toBe('58.8');

    const res = validateWeight('5B.8kg', 0.95);
    expect(res.isValid).toBe(true);
    expect(res.weight).toBe(58.8);
  });

  it('rejects or flags warning for OCR confidence below 90%', () => {
    const res = validateWeight('72.5 kg', 0.85);
    expect(res.isValid).toBe(false);
    expect(res.confidenceTier).toBe('RETAKE_WARNING');
  });

  it('rejects weights outside valid range (20kg - 250kg)', () => {
    const resTooLow = validateWeight('12.0 kg', 0.99);
    expect(resTooLow.isValid).toBe(false);

    const resTooHigh = validateWeight('320.0 kg', 0.99);
    expect(resTooHigh.isValid).toBe(false);
  });
});
