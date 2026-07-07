import { getOsUnixSshConfigHostBlockRange } from './getOsUnixSshConfigHostBlockRange';

describe('getOsUnixSshConfigHostBlockRange', () => {
  const lines = [
    'Host one',
    '  HostName a',
    '  Port 22',
    'Host two',
    '  HostName b',
    'Match host c',
    '  User ignored',
  ];

  test('finds a block that ends at the next Host line', () => {
    const range = getOsUnixSshConfigHostBlockRange({ lines, alias: 'one' });
    expect(range).toEqual({ start: 0, endExclusive: 3 });
  });

  test('finds a block that ends at a Match line', () => {
    const range = getOsUnixSshConfigHostBlockRange({ lines, alias: 'two' });
    expect(range).toEqual({ start: 3, endExclusive: 5 });
  });

  test('returns null when the alias is absent', () => {
    const range = getOsUnixSshConfigHostBlockRange({ lines, alias: 'nope' });
    expect(range).toEqual(null);
  });

  test('finds a block that ends at end of file', () => {
    const range = getOsUnixSshConfigHostBlockRange({
      lines: ['Host solo', '  HostName x', '  Port 1'],
      alias: 'solo',
    });
    expect(range).toEqual({ start: 0, endExclusive: 3 });
  });
});
