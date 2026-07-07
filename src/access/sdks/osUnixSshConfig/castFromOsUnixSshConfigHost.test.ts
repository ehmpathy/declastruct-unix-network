import { castFromOsUnixSshConfigHost } from './castFromOsUnixSshConfigHost';
import type { OsUnixSshConfigHost } from './dobj.OsUnixSshConfigHost';

describe('castFromOsUnixSshConfigHost', () => {
  test('formats a full block with two-space indented keywords', () => {
    const host: OsUnixSshConfigHost = {
      alias: 'grove.ehmpathy',
      hostName: 'localhost',
      port: 2222,
      user: 'ec2-user',
      identityFile: '~/.ssh/declastruct-demo',
    };

    const text = castFromOsUnixSshConfigHost({ host });

    expect(text).toEqual(
      [
        'Host grove.ehmpathy',
        '  HostName localhost',
        '  Port 2222',
        '  User ec2-user',
        '  IdentityFile ~/.ssh/declastruct-demo',
      ].join('\n'),
    );
  });

  test('omits keywords whose value is null', () => {
    const host: OsUnixSshConfigHost = {
      alias: 'bare',
      hostName: null,
      port: null,
      user: null,
      identityFile: null,
    };

    const text = castFromOsUnixSshConfigHost({ host });

    expect(text).toEqual('Host bare');
  });
});
