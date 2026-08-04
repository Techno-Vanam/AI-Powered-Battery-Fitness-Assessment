import { SevenSegmentLCDRecognitionEngine } from './SevenSegmentLCDRecognitionEngine';

describe('SevenSegmentLCDRecognitionEngine', () => {
  it('decodes 7-segment display boolean states to numeric digits 0-9', () => {
    const digit0 = SevenSegmentLCDRecognitionEngine.decodeSegmentToDigit({
      a: true, b: true, c: true, d: false, e: true, f: true, g: true
    });
    expect(digit0).toBe('0');

    const digit5 = SevenSegmentLCDRecognitionEngine.decodeSegmentToDigit({
      a: true, b: true, c: false, d: true, e: false, f: true, g: true
    });
    expect(digit5).toBe('5');

    const digit8 = SevenSegmentLCDRecognitionEngine.decodeSegmentToDigit({
      a: true, b: true, c: true, d: true, e: true, f: true, g: true
    });
    expect(digit8).toBe('8');
  });

  it('disambiguates LCD 7-segment misreads (5B.8kg -> 58.8, 7O.2 -> 70.2)', () => {
    const res1 = SevenSegmentLCDRecognitionEngine.parseSevenSegmentLCDWeight('5B.8kg');
    expect(res1.weight).toBe(58.8);

    const res2 = SevenSegmentLCDRecognitionEngine.parseSevenSegmentLCDWeight('7O.2');
    expect(res2.weight).toBe(70.2);

    const res3 = SevenSegmentLCDRecognitionEngine.parseSevenSegmentLCDWeight('S7.8');
    expect(res3.weight).toBe(57.8);
  });

  it('evaluates 5 consecutive matching frames before locking consensus', () => {
    let history: number[] = [];

    // Frame 1
    let eval1 = SevenSegmentLCDRecognitionEngine.evaluateFrameConsensus(57.8, history, 5);
    expect(eval1.isConsensusReached).toBe(false);
    history = eval1.updatedHistory;

    // Frame 2
    let eval2 = SevenSegmentLCDRecognitionEngine.evaluateFrameConsensus(57.8, history, 5);
    expect(eval2.isConsensusReached).toBe(false);
    history = eval2.updatedHistory;

    // Frame 3
    let eval3 = SevenSegmentLCDRecognitionEngine.evaluateFrameConsensus(57.8, history, 5);
    expect(eval3.isConsensusReached).toBe(false);
    history = eval3.updatedHistory;

    // Frame 4
    let eval4 = SevenSegmentLCDRecognitionEngine.evaluateFrameConsensus(57.8, history, 5);
    expect(eval4.isConsensusReached).toBe(false);
    history = eval4.updatedHistory;

    // Frame 5 (Consensus Reached!)
    let eval5 = SevenSegmentLCDRecognitionEngine.evaluateFrameConsensus(57.8, history, 5);
    expect(eval5.isConsensusReached).toBe(true);
    expect(eval5.stableWeight).toBe(57.8);
  });

  it('reaches consensus with fuzzy tolerance (57.6 and 57.8 are within ±0.2 kg)', () => {
    // 57.6 and 57.8 differ by 0.2 kg — within the tolerance window, so should lock
    const history = [57.6, 57.8, 57.6, 57.8];
    const evalFuzzy = SevenSegmentLCDRecognitionEngine.evaluateFrameConsensus(57.7, history, 5, 0.2);
    expect(evalFuzzy.isConsensusReached).toBe(true);
    expect(evalFuzzy.stableWeight).not.toBeNull();
  });

  it('resets consensus if a frame fluctuates beyond ±0.2 kg tolerance (57.8 → 58.5)', () => {
    // 58.5 is 0.7 kg away from 57.8 — exceeds tolerance, consensus must not lock
    const history = [57.8, 57.8, 57.8, 57.8];
    const evalFluctuate = SevenSegmentLCDRecognitionEngine.evaluateFrameConsensus(58.5, history, 5, 0.2);
    expect(evalFluctuate.isConsensusReached).toBe(false);
    expect(evalFluctuate.stableWeight).toBeNull();
  });

  it('purges readings older than 3000 ms in timestamped consensus engine', () => {
    const now = 10000;
    // 2 stale readings from t=5000 (5 seconds ago > 3000 ms max age)
    const history = [
      { weight: 57.8, timestamp: 5000 },
      { weight: 57.8, timestamp: 5050 },
      { weight: 57.8, timestamp: 9800 },
      { weight: 57.8, timestamp: 9900 },
    ];

    // Frame at t=10000 -> stale readings are purged, leaving 3 active readings (not enough for 5 matches)
    const result = SevenSegmentLCDRecognitionEngine.evaluateTimestampedConsensus(
      57.8,
      history,
      now,
      3000,
      5,
      10,
      0.2
    );

    expect(result.isConsensusReached).toBe(false);
    expect(result.updatedHistory.length).toBe(3); // Only the 3 recent readings kept
  });

  it('infers missing decimal points when 3 or 4 digit integers are returned (725 -> 72.5, 1025 -> 102.5)', () => {
    const res1 = SevenSegmentLCDRecognitionEngine.parseSevenSegmentLCDWeight('725');
    expect(res1.weight).toBe(72.5);

    const res2 = SevenSegmentLCDRecognitionEngine.parseSevenSegmentLCDWeight('1025');
    expect(res2.weight).toBe(102.5);
  });

  it('disambiguates LCD letter misreads on screens (T2.5 -> 72.5, P8.5 -> 98.5, E5.2 -> 35.2)', () => {
    const resT = SevenSegmentLCDRecognitionEngine.parseSevenSegmentLCDWeight('T2.5');
    expect(resT.weight).toBe(72.5);

    const resP = SevenSegmentLCDRecognitionEngine.parseSevenSegmentLCDWeight('P8.5');
    expect(resP.weight).toBe(98.5);

    const resE = SevenSegmentLCDRecognitionEngine.parseSevenSegmentLCDWeight('E5.2');
    expect(resE.weight).toBe(35.2);
  });

  it('locks consensus instantly in 2 frames for fast sub-second scanning', () => {
    let history: number[] = [];

    // Frame 1
    let eval1 = SevenSegmentLCDRecognitionEngine.evaluateFrameConsensus(72.5, history, 2);
    expect(eval1.isConsensusReached).toBe(false);
    history = eval1.updatedHistory;

    // Frame 2 -> Sub-second locked!
    let eval2 = SevenSegmentLCDRecognitionEngine.evaluateFrameConsensus(72.5, history, 2);
    expect(eval2.isConsensusReached).toBe(true);
    expect(eval2.stableWeight).toBe(72.5);
  });
});
