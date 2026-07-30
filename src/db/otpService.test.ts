import { generateMockOTP, getLatestOTP, verifyOTP } from './otpService';

jest.mock('./schema', () => ({
  getDBConnection: jest.fn(() => ({
    execute: jest.fn(),
  })),
}));

describe('otpService', () => {
  it('verifies the generated OTP even when the DB lookup returns no rows', () => {
    const userLocalId = 'user-1';
    const otpCode = generateMockOTP(userLocalId);

    expect(getLatestOTP(userLocalId)).toBe(otpCode);
    expect(verifyOTP(userLocalId, otpCode)).toBe(true);
  });
});
