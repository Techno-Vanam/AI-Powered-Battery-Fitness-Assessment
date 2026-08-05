import { getUserByIdentifier } from './userRepository';
import { getDBConnection } from './schema';

jest.mock('./schema', () => ({
  getDBConnection: jest.fn(),
}));

describe('userRepository local lookup', () => {
  it('reads a user from the database through the sync execution path', () => {
    const mockExecuteSync = jest.fn().mockReturnValue({
      rows: [
        {
          local_id: 'user-1',
          id_type: 'NSRS',
          id_number: '123456',
          password_hash: null,
          role: 'athlete',
        },
      ],
    });

    (getDBConnection as jest.Mock).mockReturnValue({ executeSync: mockExecuteSync });

    const user = getUserByIdentifier('NSRS', '123456');

    expect(user?.local_id).toBe('user-1');
    expect(mockExecuteSync).toHaveBeenCalled();
  });
});
